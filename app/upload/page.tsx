import UploadForm from "@/components/upload/UploadForm";
import { isDevMockRoutesEnabled } from "@/lib/server/runtime";

const UploadPage = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200">
      <UploadForm allowMockMode={isDevMockRoutesEnabled()} />
    </main>
  );
};

export default UploadPage;
