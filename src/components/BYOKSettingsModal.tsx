import { GoogleGenAI } from "@google/genai";
import {
  CheckCircle2,
  Cpu,
  ExternalLink,
  Eye,
  EyeOff,
  Key,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";

export interface BYOKConfig {
  apiKey: string;
  model: string;
  isVerified: boolean;
  useBYOK: boolean;
}

interface BYOKSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BYOKConfig;
  onSaveConfig: (config: BYOKConfig) => void;
}

export const AVAILABLE_MODELS = [
  {
    id: "gemini-3.7-flash",
    name: "Gemini 3.7 Flash",
    tag: "Recommended",
    description:
      "State-of-the-art multimodal model. Ultra-fast, highly intelligent, optimal for instant bookmark taxonomy.",
  },
  {
    id: "gemini-3.7-pro",
    name: "Gemini 3.7 Pro",
    tag: "Deep Taxonomy",
    description:
      "Flagship intelligence model for complex, multi-tier bookmark taxonomies and precise domain tagging.",
  },
  {
    id: "gemini-3.7-flash-thinking",
    name: "Gemini 3.7 Flash Thinking",
    tag: "Reasoning",
    description:
      "Thinking process model that deeply analyzes semantic relationship between URLs before categorization.",
  },
  {
    id: "gemini-3.1-pro-preview",
    name: "Gemini 3.1 Pro",
    tag: "High Precision",
    description:
      "Analytical precision model for specialized, multilingual, and technical bookmark collections.",
  },
  {
    id: "gemini-3.1-flash-lite",
    name: "Gemini 3.1 Flash Lite",
    tag: "Fast & Light",
    description: "Lightweight, ultra-low latency model for high-throughput batch classification.",
  },
];

const sanitizeModelId = (m?: string): string => {
  return m?.trim() || "gemini-3.7-flash";
};

export const BYOKSettingsModal: React.FC<BYOKSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [model, setModel] = useState(sanitizeModelId(config.model));
  const [useBYOK, setUseBYOK] = useState(config.useBYOK);
  const [showKey, setShowKey] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<"idle" | "success" | "error">(
    config.isVerified ? "success" : "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setApiKey(config.apiKey);
    setModel(sanitizeModelId(config.model));
    setUseBYOK(config.useBYOK);
    setVerifyStatus(config.isVerified ? "success" : "idle");
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setVerifyStatus("error");
      setErrorMessage("Please enter an API key first.");
      return;
    }

    setIsVerifying(true);
    setErrorMessage("");

    try {
      const activeModel = sanitizeModelId(model);
      const ai = new GoogleGenAI({
        apiKey: apiKey.trim(),
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build-client-verify",
          },
        },
      });
      const resp = await ai.models.generateContent({
        model: activeModel,
        contents: "ping",
      });
      if (resp && resp.text) {
        setVerifyStatus("success");
        setIsVerifying(false);
        return;
      }

      setVerifyStatus("error");
      setErrorMessage("Verification returned an empty response.");
    } catch (err: any) {
      setVerifyStatus("error");
      setErrorMessage(
        err.message || "Key verification failed. Check the key or your network connection.",
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSave = () => {
    const isKeyPresent = Boolean(apiKey.trim());
    onSaveConfig({
      apiKey: apiKey.trim(),
      model,
      isVerified: verifyStatus === "success",
      useBYOK: isKeyPresent ? useBYOK : false,
    });
    onClose();
  };

  const handleClear = () => {
    setApiKey("");
    setVerifyStatus("idle");
    setUseBYOK(false);
    onSaveConfig({
      apiKey: "",
      model: "gemini-3.7-flash",
      isVerified: false,
      useBYOK: false,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150 font-mono">
      <div className="w-full max-w-xl border border-white/20 bg-[#141416] p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center border border-[#FF4D00] bg-[#FF4D00]/10 text-[#FF4D00]">
              <Key className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-[#F8F7F4] uppercase font-['Syne']">
                  BYOK Format: Gemini API Key
                </h3>
                <span className="border border-[#FF4D00]/40 bg-[#FF4D00]/10 px-2 py-0.5 text-[9px] font-bold text-[#FF4D00] uppercase tracking-wider">
                  BYOK Active
                </span>
              </div>
              <p className="text-[11px] text-white/50">
                Direct, client-configured Google Gemini model credentials.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/40 hover:text-white text-xs"
          >
            [ESC]
          </button>
        </div>

        {/* Form Body */}
        <div className="mt-5 space-y-5">
          {/* Privacy Guarantee */}
          <div className="flex items-start gap-3 border border-white/10 bg-[#0C0C0D] p-3 text-xs text-white/70">
            <ShieldCheck className="h-4 w-4 text-[#FF4D00] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#F8F7F4] uppercase text-[11px]">
                Secure Client-Stored Key
              </p>
              <p className="text-[10px] text-white/50 mt-0.5">
                Your key is stored strictly in your browser&apos;s localStorage and passed only to
                your categorization requests.
              </p>
            </div>
          </div>

          {/* Toggle BYOK */}
          <div className="flex items-center justify-between p-3 border border-white/10 bg-[#0C0C0D]">
            <div className="space-y-0.5">
              <label
                htmlFor="toggle-byok"
                className="text-xs font-bold text-[#F8F7F4] uppercase cursor-pointer"
              >
                Enable Custom BYOK Mode
              </label>
              <p className="text-[10px] text-white/50">
                Use your own Gemini API key directly from this browser.
              </p>
            </div>
            <input
              id="toggle-byok"
              type="checkbox"
              checked={useBYOK}
              onChange={(e) => setUseBYOK(e.target.checked)}
              className="accent-[#FF4D00] cursor-pointer"
            />
          </div>

          {/* API Key Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#F8F7F4] uppercase">
                Google Gemini API Key
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-[10px] font-bold text-[#FF4D00] hover:underline uppercase"
              >
                <span>Get key at Google AI Studio</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setVerifyStatus("idle");
                }}
                placeholder="AIzaSy..."
                className="w-full border border-white/20 bg-[#0C0C0D] px-3.5 py-2 pr-12 text-xs font-mono text-[#F8F7F4] placeholder-white/20 focus:border-[#FF4D00] outline-none"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-1 text-white/40 hover:text-white"
                  title={showKey ? "Hide key" : "Show key"}
                >
                  {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Validation Feedback */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5 text-xs">
                {verifyStatus === "success" && (
                  <span className="flex items-center gap-1 font-bold text-emerald-400 text-[11px]">
                    <CheckCircle2 className="h-3 w-3" />
                    KEY VERIFIED &amp; READY
                  </span>
                )}
                {verifyStatus === "error" && (
                  <span className="flex items-center gap-1 font-bold text-rose-400 text-[11px]">
                    <XCircle className="h-3 w-3" />
                    {errorMessage || "INVALID API KEY"}
                  </span>
                )}
                {verifyStatus === "idle" && (
                  <span className="text-[10px] text-white/40">
                    {apiKey ? "Click 'Test & Verify' to validate" : "No key provided yet"}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleTestKey}
                disabled={isVerifying || !apiKey.trim()}
                className="inline-flex items-center gap-1.5 border border-white/20 bg-white/[0.04] px-2.5 py-1 text-xs font-bold uppercase text-[#F8F7F4] hover:border-[#FF4D00] disabled:opacity-40"
              >
                {isVerifying ? (
                  <RefreshCw className="h-3 w-3 animate-spin text-[#FF4D00]" />
                ) : (
                  <Sparkles className="h-3 w-3 text-[#FF4D00]" />
                )}
                <span>Test &amp; Verify Key</span>
              </button>
            </div>
          </div>

          {/* Model Selection */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <label className="text-xs font-bold text-[#F8F7F4] uppercase flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-[#FF4D00]" />
              <span>Preferred Gemini Model</span>
            </label>

            <div className="grid grid-cols-1 gap-2">
              {AVAILABLE_MODELS.map((m) => {
                const isSelected = model === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setModel(m.id)}
                    className={`cursor-pointer border p-3 transition-all ${
                      isSelected
                        ? "border-[#FF4D00] bg-[#FF4D00]/10"
                        : "border-white/10 bg-[#0C0C0D] hover:border-white/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="model_select"
                          checked={isSelected}
                          onChange={() => setModel(m.id)}
                          className="accent-[#FF4D00]"
                        />
                        <span className="text-xs font-bold text-[#F8F7F4] uppercase">{m.name}</span>
                      </div>
                      <span className="border border-white/10 bg-white/5 px-1.5 py-0.2 text-[9px] font-mono font-bold text-[#FF4D00]">
                        {m.tag}
                      </span>
                    </div>
                    <p className="mt-1 pl-5 text-[10px] text-white/50">{m.description}</p>
                  </div>
                );
              })}

              {/* Custom Model ID Input */}
              <div
                className={`border p-3 transition-all ${
                  !AVAILABLE_MODELS.some((m) => m.id === model)
                    ? "border-[#FF4D00] bg-[#FF4D00]/10"
                    : "border-white/10 bg-[#0C0C0D]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="model_select"
                      checked={!AVAILABLE_MODELS.some((m) => m.id === model)}
                      onChange={() => {
                        if (AVAILABLE_MODELS.some((m) => m.id === model)) {
                          setModel("gemini-3.7-flash");
                        }
                      }}
                      className="accent-[#FF4D00]"
                    />
                    <span className="text-xs font-bold text-[#F8F7F4] uppercase">
                      Custom Gemini Model ID
                    </span>
                  </div>
                  <span className="border border-white/10 bg-white/5 px-1.5 py-0.2 text-[9px] font-mono font-bold text-white/60">
                    Advanced
                  </span>
                </div>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value.trim())}
                  placeholder="e.g. gemini-3.7-flash, gemini-3.7-pro"
                  className="w-full border border-white/20 bg-[#0C0C0D] px-3 py-1.5 text-xs font-mono text-[#F8F7F4] placeholder-white/20 focus:border-[#FF4D00] outline-none"
                />
                <p className="mt-1 text-[10px] text-white/40">
                  Specify any experimental, fine-tuned, or newly released Gemini model endpoint.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/10">
          {apiKey ? (
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 hover:underline uppercase"
            >
              <Trash2 className="h-3 w-3" />
              <span>Clear Key</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-white/20 text-xs font-bold uppercase text-[#F8F7F4]/70 hover:text-[#F8F7F4]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-[#FF4D00] text-[#111113] text-xs font-bold uppercase tracking-wider hover:bg-[#FF6622]"
            >
              Save BYOK Config
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
