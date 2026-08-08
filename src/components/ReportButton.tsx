import React, { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Flag, AlertTriangle } from 'lucide-react';
import { moderationService, REPORT_REASONS } from '../services/moderation';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface ReportButtonProps {
    contentId: string;
    contentType: 'question' | 'answer' | 'document';
    className?: string;
}

export function ReportButton({ contentId, contentType, className = '' }: ReportButtonProps) {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleReport = async () => {
        if (!user) {
            toast.error("Error", {
                description: "Debes iniciar sesión para reportar contenido.",
            });
            return;
        }

        if (!reason) {
            toast.error("Error", {
                description: "Por favor selecciona un motivo.",
            });
            return;
        }

        try {
            setSubmitting(true);
            await moderationService.reportContent(contentId, contentType, reason, user.id);

            toast.success("Reporte enviado", {
                description: "Gracias por ayudar a mantener segura la comunidad.",
            });

            setOpen(false);
            setReason('');
        } catch (error) {
            toast.error("Error", {
                description: "No se pudo enviar el reporte. Intenta de nuevo.",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className={`text-gray-500 hover:text-red-600 ${className}`}>
                    <Flag className="size-4 mr-1" />
                    <span className="sr-only">Reportar</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="size-5 text-red-600" />
                        Reportar contenido
                    </DialogTitle>
                    <DialogDescription>
                        Ayúdanos a entender por qué este contenido no debería estar en TutorApp.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <Select value={reason} onValueChange={setReason}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona un motivo" />
                        </SelectTrigger>
                        <SelectContent>
                            {REPORT_REASONS.map((r) => (
                                <SelectItem key={r} value={r}>{r}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button variant="destructive" onClick={handleReport} disabled={submitting}>
                        {submitting ? 'Enviando...' : 'Enviar Reporte'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
