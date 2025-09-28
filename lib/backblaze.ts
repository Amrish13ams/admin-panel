export async function uploadToB2(file: File, folder: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
  
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
  
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data.fileKey; // save this in DB 
  }
  