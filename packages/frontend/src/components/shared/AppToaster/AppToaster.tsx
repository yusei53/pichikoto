import { XIcon } from "lucide-react"
import { IconButton } from "~/components/ui/icon-button"
import { Toast } from "~/components/ui/toast"

export const toaster = Toast.createToaster({
    placement: 'bottom-start',
    overlap: true,
    gap: 16,
})

export const AppToaster: React.FC = () => {
    return (
        <Toast.Toaster toaster={toaster}>
            {(toast) => (
                <Toast.Root key={toast.id}>
                    <Toast.Title>{toast.title}</Toast.Title>
                    <Toast.Description>{toast.description}</Toast.Description>
                    <Toast.CloseTrigger asChild>
                        <IconButton size="sm" variant="link">
                            <XIcon />
                        </IconButton>
                    </Toast.CloseTrigger>
                </Toast.Root>
            )}
        </Toast.Toaster>
    )
}