import { loginAction } from "../actions";

export const metadata = { title: "دخول الإدارة" };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="relative flex-1 flex items-center justify-center p-4 overflow-hidden bg-teal-900">
      <div className="blob w-96 h-96 bg-rose-600/50 -top-20 -start-20" />
      <div className="blob w-80 h-80 bg-save-600/40 bottom-0 end-10" style={{ animationDelay: "-7s" }} />
      <form
        action={loginAction}
        className="relative w-full max-w-sm rounded-3xl bg-white p-8 space-y-5 shadow-2xl"
      >
        <div className="text-center">
          <span className="font-heading text-4xl font-bold text-teal-900">
            وفّري<span className="text-rose-600">.</span>
          </span>
          <p className="text-ink/50 text-sm mt-2">لوحة الإدارة — دخول مصرّح فقط</p>
        </div>
        {error && (
          <p className="text-sm text-rose-600 text-center bg-rose-100 rounded-xl py-2">
            كلمة المرور غير صحيحة.
          </p>
        )}
        <input
          type="password"
          name="password"
          required
          autoFocus
          placeholder="كلمة المرور"
          className="w-full rounded-xl border border-teal-700/20 px-4 py-3 outline-none focus:border-rose-600 transition-colors"
        />
        <button className="w-full rounded-xl bg-rose-600 text-white py-3 font-semibold hover:brightness-110 transition-all">
          دخول
        </button>
      </form>
    </main>
  );
}
