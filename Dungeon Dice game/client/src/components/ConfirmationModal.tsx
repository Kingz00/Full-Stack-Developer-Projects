import './ConfirmationModal.css'

interface ConfirmationModalProps {
    isOpen: boolean
    eyebrow: string
    title: string
    message: string
    confirmLabel: string
    cancelLabel?: string
    onConfirm: () => void
    onCancel: () => void
}

function ConfirmationModal({
    isOpen,
    eyebrow,
    title,
    message,
    confirmLabel,
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
}: ConfirmationModalProps) {
    if (!isOpen) {
        return null
    }

    return (
        <div
            className="confirmation-modal"
            role="presentation"
        >
            <button
                type="button"
                className="confirmation-modal__backdrop"
                aria-label="Close confirmation dialog"
                onClick={onCancel}
            />

            <section
                className="confirmation-modal__dialog"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirmation-modal-title"
                aria-describedby="confirmation-modal-message"
            >
                <div
                    className="confirmation-modal__ornament"
                    aria-hidden="true"
                >
                    <span />
                </div>

                <p className="confirmation-modal__eyebrow">
                    {eyebrow}
                </p>

                <h2 id="confirmation-modal-title">
                    {title}
                </h2>

                <p id="confirmation-modal-message">
                    {message}
                </p>

                <div className="confirmation-modal__actions">
                    <button
                        type="button"
                        className="confirmation-modal__cancel"
                        onClick={onCancel}
                    >
                        {cancelLabel}
                    </button>

                    <button
                        type="button"
                        className="confirmation-modal__confirm"
                        onClick={onConfirm}
                        autoFocus
                    >
                        {confirmLabel}
                    </button>
                </div>
            </section>
        </div>
    )
}

export default ConfirmationModal