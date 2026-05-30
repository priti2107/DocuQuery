import { createFileRoute } from "@tanstack/react-router";
import { Edit3, UploadCloud, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_user/profile")({ component: Profile });

const skills = ["Data Science", "NLP", "Python", "Machine Learning", "AI Ethics", "React", "SQL", "Cloud Computing", "Git", "Docker", "LaTeX", "R Research"];

function Profile() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="surface-card flex flex-wrap items-center gap-5 p-6">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-sage to-primary" />
          <button className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground shadow-soft">
            <Edit3 className="h-3 w-3" />
          </button>
        </div>
        <div className="flex-1">
          <h1 className="font-serif text-3xl font-semibold">Alex Thompson</h1>
          <p className="text-sm text-muted-foreground">Senior Research Analyst • Oxford, UK</p>
        </div>
        <Button variant="outline" className="rounded-full">Edit Profile</Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="surface-card space-y-5 p-6 lg:col-span-2">
          <h2 className="font-serif text-xl font-semibold">Personal Information</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="First Name" value="Alex" />
            <Field label="Last Name" value="Thompson" />
            <Field label="Email Address" value="alex.thompson@research.org" />
            <Field label="Phone Number" value="+44 7700 900000" />
          </div>
          <div>
            <Label className="text-sm font-medium">Biography</Label>
            <Textarea defaultValue="Passionate about leveraging AI for accelerating academic research and document intelligence. Currently focused on large-scale textual data analysis." className="mt-1.5 min-h-24" />
          </div>
        </div>

        <div className="space-y-5">
          <div className="surface-card p-6">
            <h2 className="font-serif text-xl font-semibold">Expertise & Skills</h2>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span key={s} className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-primary">{s}</span>
              ))}
            </div>
          </div>

          <div className="surface-card p-6">
            <h2 className="font-serif text-xl font-semibold">Resume</h2>
            <div className="mt-4 grid place-items-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-6 text-center">
              <UploadCloud className="h-8 w-8 text-primary" />
              <div className="mt-2 text-sm font-medium">Click or drag resume here</div>
              <div className="text-xs text-muted-foreground">PDF, DOCX (Max 5MB)</div>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-sm">
              <FileText className="h-4 w-4 text-primary" />
              <span>Alex_CV_2024.pdf</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="ghost">Discard Changes</Button>
        <Button className="rounded-full px-6">Save Changes</Button>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Label className="text-sm font-medium">{label}</Label>
      <Input defaultValue={value} className="mt-1.5" />
    </div>
  );
}
