import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import JobForm from "@/components/JobForm";

export default function Page() {
  return (
    <main className="grid gap-6">
      <Card className="border-slate-700 bg-slate-900/60 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-xl text-white">Comece aqui</CardTitle>
        </CardHeader>
        <CardContent>
          <JobForm />
        </CardContent>
      </Card>
    </main>
  );
}
