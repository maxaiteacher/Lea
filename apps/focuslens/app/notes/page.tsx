import { addNote, deleteNote } from "./actions";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const supabase = await createClient();
  const { data: notes, error } = await supabase
    .from("notes")
    .select("id, content, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold">메모</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          RLS 정책 덕분에 자기가 쓴 메모만 조회되고 수정할 수 있습니다.
        </p>
      </div>

      <form action={addNote} className="flex gap-2">
        <input
          name="content"
          required
          maxLength={2000}
          placeholder="메모를 입력하세요"
          className="flex-1 rounded-md border border-neutral-300 bg-transparent px-3 py-2 dark:border-neutral-700"
        />
        <button
          type="submit"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-900"
        >
          저장
        </button>
      </form>

      {error ? (
        <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          메모를 불러오지 못했습니다: {error.message}
          <br />
          <code>supabase/migrations/0001_init.sql</code> 을 Supabase SQL 편집기에서
          실행했는지 확인하세요.
        </p>
      ) : null}

      <ul className="space-y-2">
        {(notes ?? []).map((note) => (
          <li
            key={note.id}
            className="flex items-start gap-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
          >
            <div className="flex-1">
              <p className="whitespace-pre-wrap">{note.content}</p>
              <p className="mt-1 text-xs text-neutral-500">
                {new Date(note.created_at).toLocaleString("ko-KR")}
              </p>
            </div>
            <form action={deleteNote}>
              <input type="hidden" name="id" value={note.id} />
              <button type="submit" className="text-sm text-neutral-500 hover:underline">
                삭제
              </button>
            </form>
          </li>
        ))}
      </ul>

      {!error && (notes ?? []).length === 0 ? (
        <p className="text-sm text-neutral-500">아직 저장된 메모가 없습니다.</p>
      ) : null}
    </div>
  );
}
