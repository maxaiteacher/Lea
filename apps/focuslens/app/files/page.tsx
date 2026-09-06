import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { deleteFile } from "./actions";
import Uploader from "./uploader";

export const dynamic = "force-dynamic";

export default async function FilesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirectTo=/files");

  const { data: objects, error } = await supabase.storage
    .from("uploads")
    .list(user.id, { sortBy: { column: "created_at", order: "desc" } });

  // 비공개 버킷이므로 공개 URL 대신 유효 기간이 있는 서명 URL을 만들어 준다.
  const paths = (objects ?? []).map((object) => `${user.id}/${object.name}`);
  const { data: signed } = paths.length
    ? await supabase.storage.from("uploads").createSignedUrls(paths, 60 * 10)
    : { data: [] };

  const urlByPath = new Map(
    (signed ?? []).map((item) => [item.path ?? "", item.signedUrl])
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold">파일</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          비공개 <code>uploads</code> 버킷의 <code>{user.id}</code> 폴더에 저장됩니다.
        </p>
      </div>

      <Uploader userId={user.id} />

      {error ? (
        <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          파일 목록을 불러오지 못했습니다: {error.message}
          <br />
          <code>uploads</code> 버킷과 스토리지 정책이 만들어졌는지 확인하세요.
        </p>
      ) : null}

      <ul className="space-y-2">
        {(objects ?? []).map((object) => {
          const path = `${user.id}/${object.name}`;
          const url = urlByPath.get(path);
          return (
            <li
              key={path}
              className="flex items-center gap-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
            >
              <span className="flex-1 truncate text-sm">{object.name}</span>
              {url ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm underline"
                >
                  열기
                </a>
              ) : null}
              <form action={deleteFile}>
                <input type="hidden" name="path" value={path} />
                <button type="submit" className="text-sm text-neutral-500 hover:underline">
                  삭제
                </button>
              </form>
            </li>
          );
        })}
      </ul>

      {!error && (objects ?? []).length === 0 ? (
        <p className="text-sm text-neutral-500">아직 올린 파일이 없습니다.</p>
      ) : null}
    </div>
  );
}
