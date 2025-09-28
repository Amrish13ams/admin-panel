import { NextRequest, NextResponse } from "next/server";
import B2 from "backblaze-b2";

export const POST = async (req: NextRequest) => {
  try {
    const b2 = new B2({
      applicationKeyId: process.env.B2_KEY_ID!,
      applicationKey: process.env.B2_APPLICATION_KEY!,
    });
    await b2.authorize();

    const formData = await req.formData();
    const file = formData.get("file") as unknown as File;
    const folder = formData.get("folder")?.toString() || "products";

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const fileName = `${folder}/${Date.now()}-${file.name}`;

    const { uploadUrl, authorizationToken } = (await b2.getUploadUrl({ bucketId: process.env.B2_BUCKET_ID! })).data;

    await b2.uploadFile({
      uploadUrl,
      uploadAuthToken: authorizationToken,
      fileName,
      data: Buffer.from(arrayBuffer),
    });

    return NextResponse.json({ fileKey: fileName });
  } catch (err) {
    console.error("Upload failed:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
};
