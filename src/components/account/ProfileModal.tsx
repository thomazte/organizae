import { useEffect, useRef, useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { Avatar } from "./Avatar";
import { useProfileStore } from "@/store/useProfile";
import { useProfileModal } from "@/store/useProfileModal";
import { resizeImageToDataUrl } from "@/lib/image";

export function ProfileModal() {
  const open = useProfileModal((s) => s.open);
  const setOpen = useProfileModal((s) => s.setOpen);
  const profile = useProfileStore();
  const setProfile = useProfileStore((s) => s.setProfile);
  const toast = useToast();

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(profile.name);
      setAvatar(profile.avatar);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onClose = () => setOpen(false);

  const handleFile = async (file: File) => {
    setProcessing(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      setAvatar(dataUrl);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao carregar imagem.");
    } finally {
      setProcessing(false);
    }
  };

  const handleSave = () => {
    setProfile({ name: name.trim(), avatar });
    toast.success("Perfil atualizado!");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title="Editar perfil"
      description="Personalize seu nome e foto."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={processing}>
            Salvar
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Avatar name={name} avatar={avatar} size={88} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-md hover:bg-brand-700 transition-colors"
              aria-label="Trocar foto"
            >
              <Camera size={15} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => fileRef.current?.click()}
              disabled={processing}
            >
              {processing ? "Processando..." : "Escolher foto"}
            </Button>
            {avatar && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setAvatar(null)}
                aria-label="Remover foto"
              >
                <Trash2 size={15} /> Remover
              </Button>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
              e.target.value = "";
            }}
          />
        </div>

        <Field label="Nome">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Como quer ser chamado?"
            maxLength={40}
            autoFocus
          />
        </Field>
      </div>
    </Modal>
  );
}
