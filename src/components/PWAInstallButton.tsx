import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'primary' | 'subtle';
  label?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'subtle',
  label,
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      await install();
      return;
    }
    setShowGuide(true);
  };

  const buttonText =
    label ??
    (isInstallable
      ? 'Install Android App'
      : isIOS
        ? 'Add to Home Screen'
        : isAndroid
          ? 'Install on Android'
          : 'Get Mobile App');

  const buttonStyles =
    variant === 'primary'
      ? 'bg-[#165B52] text-white hover:bg-[#0F463F]'
      : 'bg-white text-[#131B19] border border-[#D4DBD7] hover:bg-[#F1F4F2]';

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${buttonStyles}`}
      >
        {isInstallable ? (
          <Download className="w-4 h-4 shrink-0" />
        ) : (
          <Smartphone className="w-4 h-4 shrink-0" />
        )}
        <span>{buttonText}</span>
      </button>

      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#131B19]/50 backdrop-blur-xs p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="install-guide-title"
        >
          <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl border border-[#E2E6E3] p-6 shadow-xl">
            <div className="w-10 h-1.5 bg-[#D4DBD7] rounded-full mx-auto mb-4 sm:hidden" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3
                  id="install-guide-title"
                  className="font-serif text-xl font-medium text-[#131B19]"
                >
                  Install on Your Phone
                </h3>
                <p className="mt-1 text-sm text-[#4D5C58]">
                  Launch NLP Therapies Dave Chalton directly from your Android home screen in standalone app mode.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                aria-label="Close install instructions"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#4D5C58] hover:bg-[#F1F4F2] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isIOS ? (
              <ol className="mt-5 space-y-3 text-sm text-[#131B19]">
                <li className="flex gap-3">
                  <span className="font-mono text-xs text-[#165B52] font-medium pt-0.5 tabular-nums">01.</span>
                  <span>Tap the <strong>Share</strong> icon in your Safari browser toolbar.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-mono text-xs text-[#165B52] font-medium pt-0.5 tabular-nums">02.</span>
                  <span>Scroll down and select <strong>Add to Home Screen</strong>.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-mono text-xs text-[#165B52] font-medium pt-0.5 tabular-nums">03.</span>
                  <span>Tap <strong>Add</strong> to keep Dave Chalton’s NLP studio one tap away.</span>
                </li>
              </ol>
            ) : (
              <ol className="mt-5 space-y-3 text-sm text-[#131B19]">
                <li className="flex gap-3">
                  <span className="font-mono text-xs text-[#165B52] font-medium pt-0.5 tabular-nums">01.</span>
                  <span>Open this page in <strong>Chrome for Android</strong> (or Edge).</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-mono text-xs text-[#165B52] font-medium pt-0.5 tabular-nums">02.</span>
                  <span>Tap the browser menu (three vertical dots at top right) and choose <strong>Add to Home screen</strong> or <strong>Install app</strong>.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-mono text-xs text-[#165B52] font-medium pt-0.5 tabular-nums">03.</span>
                  <span>Confirm <strong>Install</strong> to run it full-screen alongside your daily Android apps.</span>
                </li>
              </ol>
            )}

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="mt-6 w-full min-h-[48px] rounded-xl bg-[#165B52] text-white text-sm font-medium hover:bg-[#0F463F] transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};
