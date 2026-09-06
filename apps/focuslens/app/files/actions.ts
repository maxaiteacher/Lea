"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function deleteFile(formData: FormData) {
  const path = String(formData.get("path") ?? "");
  if (!path) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // 자기 폴더 밖의 경로를 지우려는 요청은 여기서 한 번, 스토리지 정책에서 또 한 번 막힌다.
  if (!path.startsWith(`${user.id}/`)) return;

  await supabase.storage.from("uploads").remove([path]);

  revalidatePath("/files");
}
