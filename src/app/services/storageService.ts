// src/app/services/storageService.ts
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "@/app/lib/firebase/index"; 

const storage = getStorage(app);

export const storageService = {
  async uploadFile(path: string, file: File): Promise<string> {
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  },
};

