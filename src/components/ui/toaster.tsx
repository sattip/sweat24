import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider data-oid="x5.dga7">
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} data-oid="5to048n">
            <div className="grid gap-1" data-oid="-e0sca1">
              {title && <ToastTitle data-oid="zznz3ds">{title}</ToastTitle>}
              {description && (
                <ToastDescription data-oid="69u4-o2">
                  {description}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose data-oid="d4.9eym" />
          </Toast>
        );
      })}
      <ToastViewport data-oid="z.6b74v" />
    </ToastProvider>
  );
}
