"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type TagInputProps = {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
};

export const TagInput = ({
  value,
  onChange,
  placeholder = "Tag hinzufügen...",
}: TagInputProps) => {
  const [draft, setDraft] = useState("");

  const addTag = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (!value.includes(trimmed)) {
      onChange([...(value || []), trimmed]);
    }
    setDraft("");
  };

  const removeTag = (tag: string) => {
    onChange((value || []).filter((item) => item !== tag));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value?.length ? (
          value.map((tag) => (
            <Badge
              key={tag}
              className="flex items-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 rounded-full p-0.5 hover:bg-blue-200 text-blue-500"
                aria-label={`Tag ${tag} entfernen`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))
        ) : (
          <span className="text-xs text-slate-400 italic">
            Keine Tags ausgewählt
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addTag();
            }
          }}
          placeholder={placeholder}
          className="h-9 text-sm"
        />
        <Button
          type="button"
          variant="secondary"
          onClick={addTag}
          size="sm"
          className="h-9"
        >
          Hinzufügen
        </Button>
      </div>
    </div>
  );
};
