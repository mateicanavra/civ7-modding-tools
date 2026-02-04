export type ComputeOceanGeometryOptions = Readonly<{
  maxCoastDistance: number;
  maxCoastVectorDistance: number;
}>;

export type ComputeOceanGeometryOutput = Readonly<{
  basinId: Int32Array;
  coastDistance: Uint16Array;
  coastNormalU: Int8Array;
  coastNormalV: Int8Array;
  coastTangentU: Int8Array;
  coastTangentV: Int8Array;
}>;

