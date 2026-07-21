"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Copy,
  Download,
  FileText,
  ListChecks,
  MessageSquare,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

type ArtifactTab = "summary" | "actions" | "faq" | "comms" | "review";

type MeetingInputs = {
  meetingName: string;
  jurisdiction: string;
  meetingDate: string;
  audience: string;
  agenda: string;
  notes: string;
  commitments: string;
  owners: string;
  communicationsGuidance: string;
  reviewRequired: boolean;
  plainLanguage: boolean;
};

type TextInputKey = Exclude<keyof MeetingInputs, "reviewRequired" | "plainLanguage">;

type ActionItem = {
  id: number;
  title: string;
  owner: string;
  due: string;
  status: string;
  source: string;
};

const sampleInputs: MeetingInputs = {
  meetingName: "Community Mobility Improvements Listening Session",
  jurisdiction: "Riverton Department of Transportation",
  meetingDate: "2026-07-21",
  audience: "Residents, neighborhood association leads, council staff, and agency partners",
  agenda:
    "1. Confirm purpose and decision timeline\n2. Review bus stop accessibility requests\n3. Discuss protected crossing locations near the library and senior center\n4. Capture public questions and commitments\n5. Explain next steps and follow-up channels",
  notes:
    "Residents asked for a safer crossing at Pine and 8th, clearer detour notices during sidewalk repair, and a published schedule for bus stop bench installation. Staff confirmed that no final design decision was made at the meeting. The department will publish a plain-language summary, route unresolved questions to subject owners, and return with a refined option set before the September committee meeting.",
  commitments:
    "Publish a plain-language meeting summary by July 26 | Owner: Priya Shah | Due: 2026-07-26\nSend crossing request to traffic engineering for feasibility review | Owner: Marcus Lee | Due: 2026-08-02\nCreate an FAQ entry on detour notices and accessibility impacts | Owner: Elena Garcia | Due: 2026-07-29\nPrepare a September committee briefing with options, costs, and community concerns | Owner: Jordan Kim | Due: 2026-08-23",
  owners:
    "Priya Shah - Public engagement lead\nMarcus Lee - Traffic engineering manager\nElena Garcia - Communications manager\nJordan Kim - Capital planning analyst",
  communicationsGuidance:
    "Use plain language. Do not imply that a final design decision has been made. Clearly separate confirmed commitments from items under review. Include a translation note, ADA accommodation contact, and a human review step before publication.",
  reviewRequired: true,
  plainLanguage: true,
};

const tabs: Array<{ id: ArtifactTab; label: string; icon: LucideIcon }> = [
  { id: "summary", label: "Summary", icon: FileText },
  { id: "actions", label: "Actions", icon: ListChecks },
  { id: "faq", label: "FAQ", icon: MessageSquare },
  { id: "comms", label: "Comms", icon: Send },
  { id: "review", label: "Review", icon: ShieldCheck },
];

function splitLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function firstSentence(value: string) {
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (!cleaned) return "No approved notes or transcript were supplied yet.";
  const match = cleaned.match(/^(.+?[.!?])(\s|$)/);
  return match?.[1] ?? cleaned;
}

function parseOwnerDirectory(value: string) {
  return splitLines(value).map((line) => {
    const [name = line, role = "Owner"] = line.split(/\s+-\s+/, 2);
    return { name: name.trim(), role: role.trim() };
  });
}

function parseCommitments(
  value: string,
  owners: Array<{ name: string; role: string }>,
): ActionItem[] {
  const fallbackOwner = owners[0]?.name ?? "Unassigned";

  return splitLines(value).map((line, index) => {
    const parts = line.split("|").map((part) => part.trim());
    const title = parts[0]?.replace(/^[-*]\s*/, "") || `Follow up item ${index + 1}`;
    const owner =
      parts
        .find((part) => /^owner:/i.test(part))
        ?.replace(/^owner:\s*/i, "")
        .trim() || fallbackOwner;
    const due =
      parts
        .find((part) => /^due:/i.test(part))
        ?.replace(/^due:\s*/i, "")
        .trim() || "Needs date";

    return {
      id: index + 1,
      title,
      owner,
      due,
      status: index === 0 ? "Ready for review" : "Needs owner confirmation",
      source: line,
    };
  });
}

function keywordQuestions(agendaLines: string[], notes: string) {
  const lower = `${agendaLines.join(" ")} ${notes}`.toLowerCase();
  const questions = [
    {
      question: "Was a final decision made at the meeting?",
      answer:
        lower.includes("no final") || lower.includes("under review")
          ? "No. The draft should state that the topic remains under review unless approved records say otherwise."
          : "Only publish this as decided if the approved record clearly confirms the decision.",
    },
    {
      question: "How will residents know what happens next?",
      answer:
        "The follow-up message should link the summary, list each commitment with an owner, and identify the next public milestone.",
    },
    {
      question: "Where should accessibility, translation, or accommodation questions go?",
      answer:
        "Route them to the named communications or public engagement owner and include the official accommodation contact before release.",
    },
  ];

  if (lower.includes("detour")) {
    questions.push({
      question: "How will detour notices be communicated?",
      answer:
        "The FAQ should explain notice channels, timing, affected routes or sidewalks, and how residents can report access problems.",
    });
  }

  if (lower.includes("cost") || lower.includes("budget")) {
    questions.push({
      question: "Are costs final?",
      answer:
        "Costs should be labeled as estimates or pending review until the approving body adopts the final scope and budget.",
    });
  }

  return questions;
}

function buildArtifacts(inputs: MeetingInputs) {
  const agendaLines = splitLines(inputs.agenda);
  const owners = parseOwnerDirectory(inputs.owners);
  const actions = parseCommitments(inputs.commitments, owners);
  const questions = keywordQuestions(agendaLines, inputs.notes);
  const firstNote = firstSentence(inputs.notes);
  const ownerNames = owners.map((owner) => owner.name).join(", ") || "No owners supplied";
  const milestone =
    actions.map((action) => action.due).find((due) => /^\d{4}-\d{2}-\d{2}$/.test(due)) ??
    "the next public update";

  const summary = [
    `${inputs.meetingName || "Public meeting"} - draft follow-up summary`,
    "",
    `Host: ${inputs.jurisdiction || "Agency to confirm"}`,
    `Date: ${inputs.meetingDate || "Date to confirm"}`,
    `Audience: ${inputs.audience || "Audience to confirm"}`,
    "",
    "What happened",
    firstNote,
    "",
    "Main topics",
    ...(agendaLines.length > 0
      ? agendaLines.map((line) => `- ${line}`)
      : ["- Agenda not supplied"]),
    "",
    "Confirmed commitments",
    ...(actions.length > 0
      ? actions.map((action) => `- ${action.title} - ${action.owner}, due ${action.due}`)
      : ["- No commitments supplied yet"]),
    "",
    "Decision status",
    "This draft must not imply a final decision unless the approved record confirms one.",
  ].join("\n");

  const actionTracker = [
    "Action tracker",
    "",
    "| ID | Commitment | Owner | Due | Status |",
    "| --- | --- | --- | --- | --- |",
    ...(actions.length > 0
      ? actions.map(
          (action) =>
            `| ${action.id} | ${action.title} | ${action.owner} | ${action.due} | ${action.status} |`,
        )
      : ["| 1 | Add commitments from approved notes | Unassigned | Needs date | Not started |"]),
  ].join("\n");

  const faq = [
    "Resident FAQ",
    "",
    ...questions.flatMap((item, index) => [`${index + 1}. ${item.question}`, item.answer, ""]),
    "Source note",
    "FAQ answers should cite approved notes, transcript excerpts, or official program guidance before publication.",
  ].join("\n");

  const communicationsPlan = [
    "Follow-up communication plan",
    "",
    `Primary audience: ${inputs.audience || "Residents and meeting participants"}`,
    `Tone and constraints: ${inputs.communicationsGuidance || "Use plain language and human review."}`,
    "",
    "Channels",
    "- Website update with summary, FAQ, and action tracker",
    "- Email to meeting registrants and neighborhood contacts",
    "- Social post that links to the official summary",
    "- Internal briefing note for staff and elected offices",
    "",
    "Draft email",
    `Subject: Follow-up from ${inputs.meetingName || "the public meeting"}`,
    "",
    `Thank you for participating in ${inputs.meetingName || "the public meeting"}. We have prepared a draft summary of the discussion, current commitments, and next steps. The next visible milestone is ${milestone}.`,
    "",
    "Before publishing, staff will verify the summary against approved records and confirm that accessibility, translation, and contact information are correct.",
    "",
    `Owner directory: ${ownerNames}`,
  ].join("\n");

  const reviewChecklist = [
    "Government-ready review checklist",
    "",
    inputs.reviewRequired
      ? "[x] Human review required before publication"
      : "[ ] Human review required before publication",
    inputs.plainLanguage
      ? "[x] Plain-language mode requested"
      : "[ ] Plain-language mode requested",
    "[ ] Every claim is traceable to approved notes, transcript, agenda, or guidance",
    "[ ] No sensitive personal information is included",
    "[ ] Commitments are separated from ideas, requests, and unresolved questions",
    "[ ] Owners and dates are confirmed by the responsible team",
    "[ ] Accessibility, translation, public records, and contact language is present",
    "[ ] The communication plan avoids implying unapproved decisions",
  ].join("\n");

  return {
    agendaLines,
    owners,
    actions,
    questions,
    summary,
    actionTracker,
    faq,
    communicationsPlan,
    reviewChecklist,
  };
}

function outputForTab(tab: ArtifactTab, artifacts: ReturnType<typeof buildArtifacts>) {
  if (tab === "summary") return artifacts.summary;
  if (tab === "actions") return artifacts.actionTracker;
  if (tab === "faq") return artifacts.faq;
  if (tab === "comms") return artifacts.communicationsPlan;
  return artifacts.reviewChecklist;
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  id: TextInputKey;
  label: string;
  value: string;
  onChange: (id: TextInputKey, value: string) => void;
  placeholder: string;
  rows?: number;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-950" htmlFor={id}>
      {label}
      <textarea
        className="min-h-24 resize-y rounded-lg border-2 border-slate-950 bg-white px-3 py-2 text-sm font-medium leading-6 text-slate-900 shadow-[3px_3px_0_#0f172a] outline-none transition focus:border-blue-700 focus:shadow-[4px_4px_0_#1d4ed8]"
        id={id}
        name={id}
        onChange={(event) => onChange(id, event.target.value)}
        placeholder={placeholder}
        rows={rows}
        value={value}
      />
    </label>
  );
}

function ShortField({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  id: TextInputKey;
  label: string;
  value: string;
  onChange: (id: TextInputKey, value: string) => void;
  placeholder: string;
  type?: "text" | "date";
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-950" htmlFor={id}>
      {label}
      <input
        className="h-11 rounded-lg border-2 border-slate-950 bg-white px-3 text-sm font-semibold text-slate-900 shadow-[3px_3px_0_#0f172a] outline-none transition focus:border-blue-700 focus:shadow-[4px_4px_0_#1d4ed8]"
        id={id}
        name={id}
        onChange={(event) => onChange(id, event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </label>
  );
}

function IconButton({
  children,
  icon: Icon,
  onClick,
  variant = "primary",
}: {
  children: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: "primary" | "secondary";
}) {
  const classes =
    variant === "primary"
      ? "border-blue-950 bg-blue-600 text-white hover:bg-blue-700"
      : "border-slate-950 bg-white text-slate-950 hover:bg-slate-100";

  return (
    <button
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg border-2 px-3 text-sm font-black shadow-[3px_3px_0_#0f172a] transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#0f172a] ${classes}`}
      onClick={onClick}
      type="button"
    >
      <Icon aria-hidden="true" className="size-4" />
      {children}
    </button>
  );
}

export function PublicMeetingKit() {
  const [inputs, setInputs] = useState<MeetingInputs>(sampleInputs);
  const [activeTab, setActiveTab] = useState<ArtifactTab>("summary");
  const [copied, setCopied] = useState(false);
  const artifacts = useMemo(() => buildArtifacts(inputs), [inputs]);
  const currentOutput = outputForTab(activeTab, artifacts);
  const completionScore = [
    inputs.agenda,
    inputs.notes,
    inputs.commitments,
    inputs.owners,
    inputs.communicationsGuidance,
  ].filter((value) => value.trim().length > 0).length;

  function updateInput(id: TextInputKey, value: string) {
    setInputs((current) => ({ ...current, [id]: value }));
  }

  function updateToggle(id: "reviewRequired" | "plainLanguage", value: boolean) {
    setInputs((current) => ({ ...current, [id]: value }));
  }

  async function copyCurrentOutput() {
    await navigator.clipboard?.writeText(currentOutput);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function exportPacket() {
    const payload = {
      generatedAt: new Date().toISOString(),
      inputs,
      outputs: {
        summary: artifacts.summary,
        actions: artifacts.actionTracker,
        faq: artifacts.faq,
        communicationsPlan: artifacts.communicationsPlan,
        reviewChecklist: artifacts.reviewChecklist,
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "public-meeting-follow-up-kit.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[#f6efe4] text-slate-950" id="main-content">
      <div className="mx-auto grid w-full max-w-[1500px] gap-5 px-4 py-5 lg:grid-cols-[420px_minmax(0,1fr)] lg:px-6">
        <section className="grid content-start gap-4">
          <div className="rounded-lg border-2 border-slate-950 bg-white p-4 shadow-[5px_5px_0_#0f172a]">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="mb-2 inline-flex rounded-full border border-slate-950 bg-amber-200 px-2 py-1 text-[11px] font-black uppercase">
                  Government workflow
                </p>
                <h1 className="text-3xl font-black leading-tight tracking-normal">
                  Public Meeting Follow-Up Kit
                </h1>
              </div>
              <ClipboardList aria-hidden="true" className="mt-1 size-9 text-blue-700" />
            </div>
            <p className="text-sm font-semibold leading-6 text-slate-700">
              Turn public agenda, approved notes or transcript, commitments, owners, and
              communications guidance into a draft summary, action tracker, FAQ, and follow-up
              communication plan.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-black">
              <div className="rounded-md border-2 border-slate-950 bg-blue-100 p-2">
                {completionScore}/5 sources
              </div>
              <div className="rounded-md border-2 border-slate-950 bg-emerald-100 p-2">
                {artifacts.actions.length} actions
              </div>
              <div className="rounded-md border-2 border-slate-950 bg-violet-100 p-2">
                {artifacts.questions.length} FAQs
              </div>
            </div>
          </div>

          <div className="rounded-lg border-2 border-slate-950 bg-[#dfe9ff] p-4 shadow-[5px_5px_0_#0f172a]">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles aria-hidden="true" className="size-5 text-blue-700" />
              <h2 className="text-lg font-black">Source Material</h2>
            </div>
            <div className="grid gap-3">
              <ShortField
                id="meetingName"
                label="Meeting name"
                onChange={updateInput}
                placeholder="Community budget forum"
                value={inputs.meetingName}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <ShortField
                  id="jurisdiction"
                  label="Agency"
                  onChange={updateInput}
                  placeholder="City department"
                  value={inputs.jurisdiction}
                />
                <ShortField
                  id="meetingDate"
                  label="Date"
                  onChange={updateInput}
                  placeholder="2026-07-21"
                  type="date"
                  value={inputs.meetingDate}
                />
              </div>
              <ShortField
                id="audience"
                label="Audience"
                onChange={updateInput}
                placeholder="Residents, staff, council offices"
                value={inputs.audience}
              />
              <Field
                id="agenda"
                label="Public agenda"
                onChange={updateInput}
                placeholder="Paste agenda items..."
                rows={5}
                value={inputs.agenda}
              />
              <Field
                id="notes"
                label="Approved notes or transcript"
                onChange={updateInput}
                placeholder="Paste approved notes, transcript excerpts, or clerk-approved summary..."
                rows={6}
                value={inputs.notes}
              />
              <Field
                id="commitments"
                label="Commitments"
                onChange={updateInput}
                placeholder="Commitment | Owner: Name | Due: YYYY-MM-DD"
                rows={5}
                value={inputs.commitments}
              />
              <Field
                id="owners"
                label="Owners"
                onChange={updateInput}
                placeholder="Name - role"
                rows={4}
                value={inputs.owners}
              />
              <Field
                id="communicationsGuidance"
                label="Communications guidance"
                onChange={updateInput}
                placeholder="Tone, disclaimers, accessibility, translation, approvals..."
                rows={4}
                value={inputs.communicationsGuidance}
              />
            </div>
          </div>
        </section>

        <section className="grid content-start gap-4">
          <div className="rounded-lg border-2 border-slate-950 bg-white p-3 shadow-[5px_5px_0_#0f172a]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2" role="tablist" aria-label="Artifact views">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const selected = activeTab === tab.id;
                  return (
                    <button
                      aria-selected={selected}
                      className={`inline-flex h-10 items-center gap-2 rounded-lg border-2 px-3 text-sm font-black transition ${
                        selected
                          ? "border-slate-950 bg-slate-950 text-white"
                          : "border-slate-300 bg-white text-slate-800 hover:border-slate-950"
                      }`}
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      role="tab"
                      type="button"
                    >
                      <Icon aria-hidden="true" className="size-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-2">
                <IconButton
                  icon={RefreshCw}
                  onClick={() => setInputs(sampleInputs)}
                  variant="secondary"
                >
                  Load sample
                </IconButton>
                <IconButton icon={Copy} onClick={copyCurrentOutput}>
                  {copied ? "Copied" : "Copy"}
                </IconButton>
                <IconButton icon={Download} onClick={exportPacket} variant="secondary">
                  Export
                </IconButton>
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="rounded-lg border-2 border-slate-950 bg-[#fff7cb] p-4 shadow-[5px_5px_0_#0f172a]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase text-blue-700">
                    Reviewed draft artifact
                  </p>
                  <h2 className="text-2xl font-black">
                    {tabs.find((tab) => tab.id === activeTab)?.label}
                  </h2>
                </div>
                <CheckCircle2 aria-hidden="true" className="size-7 text-emerald-700" />
              </div>
              <pre className="min-h-[560px] overflow-auto whitespace-pre-wrap rounded-lg border-2 border-slate-950 bg-white p-4 text-sm font-semibold leading-6 text-slate-900">
                {currentOutput}
              </pre>
            </div>

            <aside className="grid content-start gap-4">
              <div className="rounded-lg border-2 border-slate-950 bg-[#dff8eb] p-4 shadow-[5px_5px_0_#0f172a]">
                <div className="mb-3 flex items-center gap-2">
                  <Users aria-hidden="true" className="size-5 text-emerald-800" />
                  <h2 className="text-lg font-black">Owner Board</h2>
                </div>
                <div className="grid gap-2">
                  {artifacts.owners.length > 0 ? (
                    artifacts.owners.map((owner) => (
                      <div
                        className="rounded-lg border-2 border-slate-950 bg-white p-3"
                        key={`${owner.name}-${owner.role}`}
                      >
                        <p className="text-sm font-black">{owner.name}</p>
                        <p className="text-xs font-bold text-slate-600">{owner.role}</p>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-lg border-2 border-slate-950 bg-white p-3 text-sm font-bold">
                      Add owners to assign follow-up work.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-lg border-2 border-slate-950 bg-[#efe4ff] p-4 shadow-[5px_5px_0_#0f172a]">
                <div className="mb-3 flex items-center gap-2">
                  <ShieldCheck aria-hidden="true" className="size-5 text-violet-800" />
                  <h2 className="text-lg font-black">Guardrails</h2>
                </div>
                <label className="mb-3 flex items-start gap-3 rounded-lg border-2 border-slate-950 bg-white p-3 text-sm font-bold">
                  <input
                    checked={inputs.reviewRequired}
                    className="mt-1 size-4 accent-blue-700"
                    onChange={(event) => updateToggle("reviewRequired", event.target.checked)}
                    type="checkbox"
                  />
                  Human review is required before anything is published.
                </label>
                <label className="mb-3 flex items-start gap-3 rounded-lg border-2 border-slate-950 bg-white p-3 text-sm font-bold">
                  <input
                    checked={inputs.plainLanguage}
                    className="mt-1 size-4 accent-blue-700"
                    onChange={(event) => updateToggle("plainLanguage", event.target.checked)}
                    type="checkbox"
                  />
                  Keep outputs plain-language and resident-facing.
                </label>
                <div className="rounded-lg border-2 border-slate-950 bg-amber-100 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <AlertTriangle aria-hidden="true" className="size-4 text-amber-800" />
                    <p className="text-sm font-black">Do not publish yet</p>
                  </div>
                  <p className="text-xs font-bold leading-5 text-slate-700">
                    Verify every claim against approved records, remove sensitive personal
                    information, and confirm owners before sharing externally.
                  </p>
                </div>
              </div>

              <div className="rounded-lg border-2 border-slate-950 bg-white p-4 shadow-[5px_5px_0_#0f172a]">
                <h2 className="mb-3 text-lg font-black">30-minute build flow</h2>
                <ol className="grid gap-2 text-sm font-bold">
                  <li className="rounded-md border border-slate-300 p-2">
                    1. Paste approved source material.
                  </li>
                  <li className="rounded-md border border-slate-300 p-2">
                    2. Review generated artifacts by tab.
                  </li>
                  <li className="rounded-md border border-slate-300 p-2">
                    3. Confirm owners, dates, and public claims.
                  </li>
                  <li className="rounded-md border border-slate-300 p-2">
                    4. Export the reviewed packet.
                  </li>
                </ol>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
