import { getFirebaseStorage } from "./firebase";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

export async function uploadCourseFile(
  courseId: string,
  lessonId: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  const storage = getFirebaseStorage();
  const storageRef = ref(
    storage,
    `courses/${courseId}/lessons/${lessonId}/${file.name}`
  );
  const task = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    task.on(
      "state_changed",
      (snapshot) => {
        const percent = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        onProgress?.(percent);
      },
      reject,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve(url);
      }
    );
  });
}

export async function uploadCourseThumbnail(
  courseId: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  const storage = getFirebaseStorage();
  const ext = file.name.substring(file.name.lastIndexOf("."));
  const storageRef = ref(storage, `courses/${courseId}/thumbnail${ext}`);
  const task = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    task.on(
      "state_changed",
      (snapshot) => {
        const percent = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        onProgress?.(percent);
      },
      reject,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve(url);
      }
    );
  });
}

export async function deleteCourseFile(path: string): Promise<void> {
  const storage = getFirebaseStorage();
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}
