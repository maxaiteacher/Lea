"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function addNote(formData: FormData) {
  const content = String(formData.get("content") ?? "").trim();
  if (!content) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // user_id 는 RLS 정책이 auth.uid() 와 대조하므로 반드시 채워 넣는다.
  await supabase.from("notes").insert({ user_id: user.id, content });

  revalidatePath("/notes");
}

export async function deleteNote(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  // 다른 사용자의 메모를 지우려는 요청은 RLS 정책이 차단한다.
  await supabase.from("notes").delete().eq("id", id);

  revalidatePath("/notes");
}
