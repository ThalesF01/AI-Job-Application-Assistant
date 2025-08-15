"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResultBlock({
  title,
  content,
}: { title: string; content: React.ReactNode }) {
  return (
    <Card className="border-slate-700 bg-slate-900/40">
      <CardHeader>
        <CardTitle className="text-lg text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent className="prose prose-invert max-w-none text-white">
        {content}
      </CardContent>
    </Card>
  );
}
