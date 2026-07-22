#!/usr/bin/env bash

set -euo pipefail

asset_dir="${1:-}"
repository="${GH_REPO:-}"
tag="${GITHUB_REF_NAME:-}"
gh_bin="${GH_BIN:-gh}"
git_bin="${GIT_BIN:-git}"
perl_bin="${PERL_BIN:-perl}"
expected_source_commit="${EXPECTED_SOURCE_COMMIT:-}"
command_timeout_seconds="${HABITAT_RELEASE_COMMAND_TIMEOUT_SECONDS:-120}"

if [[ -z "$asset_dir" || -z "$repository" || -z "$tag" || -z "$expected_source_commit" ]]; then
  printf 'Usage: GH_REPO=<owner/repo> GITHUB_REF_NAME=<tag> EXPECTED_SOURCE_COMMIT=<commit> %s <asset-directory>\n' "$0" >&2
  exit 2
fi
if [[ ! "$expected_source_commit" =~ ^[0-9a-f]{40}$ ]]; then
  printf 'EXPECTED_SOURCE_COMMIT must be one lowercase 40-character Git object ID.\n' >&2
  exit 2
fi
if [[ ! "$command_timeout_seconds" =~ ^[1-9][0-9]*$ ]]; then
  printf 'HABITAT_RELEASE_COMMAND_TIMEOUT_SECONDS must be a positive integer.\n' >&2
  exit 2
fi

asset_dir="$(cd "$asset_dir" && pwd)"
asset_names=(
  "SHA256SUMS"
  "habitat-sdk-darwin-arm64"
  "provenance.json"
)
checksum_names=(
  "habitat-sdk-darwin-arm64"
  "provenance.json"
)

run_gh() {
  local deadline_marker command_pid watchdog_pid command_status
  deadline_marker="$(mktemp "${RUNNER_TEMP:-${TMPDIR:-/tmp}}/habitat-gh-deadline.XXXXXX")"
  rm -f "$deadline_marker"

  "$gh_bin" "$@" &
  command_pid=$!
  "$perl_bin" -e '
    my ($seconds, $pid, $marker) = @ARGV;
    sleep $seconds;
    if (kill 0, $pid) {
      open my $marker_handle, ">", $marker or die "Could not mark GitHub CLI deadline: $!\n";
      close $marker_handle;
      kill "TERM", $pid;
      sleep 10;
      kill "KILL", $pid if kill 0, $pid;
    }
  ' "$command_timeout_seconds" "$command_pid" "$deadline_marker" &
  watchdog_pid=$!

  if wait "$command_pid"; then
    command_status=0
  else
    command_status=$?
  fi
  kill -TERM "$watchdog_pid" 2>/dev/null || true
  wait "$watchdog_pid" 2>/dev/null || true

  if [[ -e "$deadline_marker" ]]; then
    rm -f "$deadline_marker"
    printf 'GitHub CLI command exceeded its %s-second deadline.\n' "$command_timeout_seconds" >&2
    return 124
  fi
  rm -f "$deadline_marker"
  return "$command_status"
}

release_pages() {
  run_gh api --paginate --slurp "repos/${repository}/releases?per_page=100"
}

release_for_tag() {
  jq --arg tag "$tag" '[.[][] | select(.tag_name == $tag)]'
}

assert_exact_asset_inventory() {
  local release_json="$1"
  local observed
  observed="$(jq -r '.[0].assets | map(.name) | sort | join("\n")' <<<"$release_json")"
  local expected
  expected="$(printf '%s\n' "${asset_names[@]}" | sort)"
  if [[ "$observed" != "$expected" ]]; then
    printf 'Release %s does not contain the exact proven asset inventory.\n' "$tag" >&2
    exit 1
  fi
}

local_asset_facts() {
  local name digest size
  for name in "${asset_names[@]}"; do
    digest="$(shasum -a 256 "$asset_dir/$name" | awk '{ print $1 }')"
    size="$(wc -c < "$asset_dir/$name" | tr -d '[:space:]')"
    jq --null-input --compact-output \
      --arg name "$name" \
      --arg digest "sha256:${digest}" \
      --argjson size "$size" \
      '{ name: $name, digest: $digest, size: $size }'
  done | jq --slurp --compact-output 'sort_by(.name)'
}

assert_server_assets_match_local() {
  local release_json="$1"
  local observed expected
  observed="$(
    jq --compact-output \
      '[.[0].assets[] | { name, digest, size }] | sort_by(.name)' \
      <<<"$release_json"
  )"
  expected="$(local_asset_facts)"
  if [[ "$observed" != "$expected" ]]; then
    printf 'Release %s asset digests or sizes do not match the proven local candidate.\n' "$tag" >&2
    exit 1
  fi
}

assert_source_binding() {
  local provenance_commit checkout_commit checkout_tag_commit remote_tag_commit
  provenance_commit="$(jq --exit-status --raw-output '.source.commit' "$asset_dir/provenance.json")"
  checkout_commit="$("$git_bin" rev-parse 'HEAD^{commit}')"
  checkout_tag_commit="$("$git_bin" rev-parse "${tag}^{commit}")"
  remote_tag_commit="$(
    run_gh api "repos/${repository}/commits/${tag}" --jq '.sha'
  )"
  if [[ "$provenance_commit" != "$expected_source_commit" || \
        "$checkout_commit" != "$expected_source_commit" || \
        "$checkout_tag_commit" != "$expected_source_commit" || \
        "$remote_tag_commit" != "$expected_source_commit" ]]; then
    printf 'Release %s source binding does not match expected commit %s.\n' \
      "$tag" "$expected_source_commit" >&2
    exit 1
  fi
}

assert_local_candidate() {
  local observed
  observed="$(find "$asset_dir" -maxdepth 1 -type f -exec basename {} \; | sort)"
  local expected
  expected="$(printf '%s\n' "${asset_names[@]}" | sort)"
  if [[ "$observed" != "$expected" ]]; then
    printf 'Candidate directory does not contain the exact release asset inventory.\n' >&2
    exit 1
  fi
  local observed_checksums expected_checksums checksum_line_count
  observed_checksums="$(
    sed -E -n 's/^[0-9a-f]{64}  ([^/]+)$/\1/p' "$asset_dir/SHA256SUMS" | sort
  )"
  expected_checksums="$(printf '%s\n' "${checksum_names[@]}" | sort)"
  checksum_line_count="$(awk 'NF { count += 1 } END { print count + 0 }' "$asset_dir/SHA256SUMS")"
  if [[ "$observed_checksums" != "$expected_checksums" || "$checksum_line_count" -ne 2 ]]; then
    printf 'Candidate SHA256SUMS does not cover each payload asset exactly once.\n' >&2
    exit 1
  fi
  (cd "$asset_dir" && shasum -a 256 -c SHA256SUMS)
}

assert_published_immutable() {
  local release_json="$1"
  if [[ "$(jq -r '.[0].draft' <<<"$release_json")" != "false" ]]; then
    printf 'Release %s is not published.\n' "$tag" >&2
    exit 1
  fi
  if [[ "$(jq -r '.[0].immutable' <<<"$release_json")" != "true" ]]; then
    printf 'Release %s is published but not immutable.\n' "$tag" >&2
    exit 1
  fi
  assert_exact_asset_inventory "$release_json"
  assert_server_assets_match_local "$release_json"
}

assert_remote_bytes() {
  local download_root
  download_root="$(mktemp -d "${RUNNER_TEMP:-${TMPDIR:-/tmp}}/habitat-release-verify.XXXXXX")"
  trap 'rm -rf "$download_root"' RETURN
  run_gh release download "$tag" --repo "$repository" --dir "$download_root"
  local observed
  observed="$(find "$download_root" -maxdepth 1 -type f -exec basename {} \; | sort)"
  local expected
  expected="$(printf '%s\n' "${asset_names[@]}" | sort)"
  if [[ "$observed" != "$expected" ]]; then
    printf 'Downloaded release %s does not contain the exact asset inventory.\n' "$tag" >&2
    exit 1
  fi
  cmp "$asset_dir/SHA256SUMS" "$download_root/SHA256SUMS"
  (cd "$download_root" && shasum -a 256 -c SHA256SUMS)
  rm -rf "$download_root"
  trap - RETURN
}

assert_local_candidate
assert_source_binding
existing="$(release_pages | release_for_tag)"
count="$(jq 'length' <<<"$existing")"

if [[ "$count" -gt 1 ]]; then
  printf 'Repository returned more than one release for tag %s.\n' "$tag" >&2
  exit 1
fi

if [[ "$count" -eq 1 ]]; then
  assert_published_immutable "$existing"
  assert_remote_bytes
  assert_source_binding
  printf 'Verified existing immutable release %s.\n' "$tag"
  exit 0
fi

run_gh release create "$tag" \
  --repo "$repository" \
  --draft \
  --verify-tag \
  --title "Habitat SDK standalone check ${tag}" \
  --notes "Pinned check-only Habitat SDK assets. Exact source, compiler distribution, and artifact identities are recorded in provenance.json and SHA256SUMS."

run_gh release upload "$tag" \
  --repo "$repository" \
  "$asset_dir/habitat-sdk-darwin-arm64" \
  "$asset_dir/provenance.json" \
  "$asset_dir/SHA256SUMS"

draft="$(release_pages | release_for_tag)"
if [[ "$(jq 'length' <<<"$draft")" != "1" || "$(jq -r '.[0].draft' <<<"$draft")" != "true" ]]; then
  printf 'Release %s was not retained as one draft before publication.\n' "$tag" >&2
  exit 1
fi
assert_exact_asset_inventory "$draft"
assert_server_assets_match_local "$draft"
assert_source_binding

run_gh release edit "$tag" --repo "$repository" --draft=false

published="$(release_pages | release_for_tag)"
if [[ "$(jq 'length' <<<"$published")" != "1" ]]; then
  printf 'Published release %s could not be resolved exactly once.\n' "$tag" >&2
  exit 1
fi
assert_published_immutable "$published"
assert_remote_bytes
printf 'Published and verified immutable release %s.\n' "$tag"
