interface PromptMomentNotification {
  isDisplayMoment(): boolean;
  isNotDisplayed(): boolean;
  isSkippedMoment(): boolean;
  isDismissedMoment(): boolean;
  getNotDisplayedReason(): string | undefined;
  getSkippedReason(): string | undefined;
  getDismissedReason(): "cancel" | "dismiss" | "credential_returned" | undefined;
  getMomentType(): string;
}

interface Window {
  google?: {
    accounts: {
      id: {
        initialize: (config: {
          client_id: string;
          callback: (response: { credential: string }) => void;
          cancel_on_tap_outside?: boolean;
          error_callback?: (error: { type: string; message?: string }) => void;
        }) => void;
        prompt: (momentListener?: (moment: PromptMomentNotification) => void) => void;
        renderButton: (
          element: HTMLElement,
          options: {
            type?: "standard" | "icon";
            theme?: "outline" | "filled_blue" | "filled_black";
            size?: "large" | "medium" | "small";
            text?: "signin_with" | "signup_with" | "continue_with" | "signin";
            shape?: "rectangular" | "pill" | "circle" | "square";
            logo_alignment?: "left" | "center";
            width?: string;
          }
        ) => void;
        disableAutoSelect: () => void;
        cancel: () => void;
      };
    };
  };
}
