this is completely wrong.

module dtos and policy belong in the module/model directory

whatever "baseline" is -- it's not a top level model kind, and it should alredy be banned by the pattern. if not, then fix it because the pattern is suppsoed to be allowlist only for the tree shape

what you're doing here is a major design smell that is causing your mental model to break


all of this shit here is NOT relevant at the service level. nearly all of it is module-local. the fact you keep treating it as service level is why the rest of it is confusing. you're pretending as if these models for fix, verify, etc. are somehow external to the service and trying to work them back in. but that's wrong -- it's actually the exacty opposite.
