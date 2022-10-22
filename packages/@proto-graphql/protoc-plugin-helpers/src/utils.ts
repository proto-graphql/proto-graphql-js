import { CodeGeneratorRequest, CodeGeneratorResponse } from "google-protobuf/google/protobuf/compiler/plugin_pb";

// https://github.com/improbable-eng/ts-protoc-gen/blob/0.12.0/src/util.ts#L59-L77
function withAllStdIn(callback: (buffer: Buffer) => void): void {
  const ret: Buffer[] = [];
  let len = 0;

  const stdin = process.stdin;
  stdin.on("readable", function () {
    let chunk;

    while ((chunk = stdin.read())) {
      if (!(chunk instanceof Buffer)) throw new Error("Did not receive buffer");
      ret.push(chunk);
      len += chunk.length;
    }
  });

  stdin.on("end", function () {
    callback(Buffer.concat(ret, len));
  });
}

export function withCodeGeneratorRequest(f: (req: CodeGeneratorRequest) => CodeGeneratorResponse): void {
  withAllStdIn((inputBuf) => {
    const typedInputBuf = new Uint8Array(inputBuf.length);
    typedInputBuf.set(inputBuf);

    const req = CodeGeneratorRequest.deserializeBinary(typedInputBuf);

    process.stdout.write(Buffer.from(f(req).serializeBinary()));
  });
}
