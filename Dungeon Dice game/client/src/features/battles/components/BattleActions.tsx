import './BattleActions.css'

interface BattleActionsProps {
    isBattleResolved: boolean
    isProcessing: boolean
    error: string | null
    onStartNewBattle: () => void
    onCompleteRun: () => void
    onAbandonRun: () => void
}

function BattleActions({
    isBattleResolved,
    isProcessing,
    error,
    onStartNewBattle,
    onCompleteRun,
    onAbandonRun,
}: BattleActionsProps) {
    return (
        <section
            className="battle-actions"
            aria-label="Run actions"
        >
            {isBattleResolved && (
                <button
                    type="button"
                    className="battle-actions__button battle-actions__button--primary"
                    onClick={onStartNewBattle}
                    disabled={isProcessing}
                >
                    {isProcessing ? 'Processing…' : 'Start New Battle'}
                </button>
            )}

            <div className="battle-actions__run-controls">
                <button
                    type="button"
                    className="battle-actions__button battle-actions__button--danger"
                    onClick={onAbandonRun}
                    disabled={isProcessing}
                >
                    Abandon Run
                </button>

                <button
                    type="button"
                    className="battle-actions__button battle-actions__button--gold"
                    onClick={onCompleteRun}
                    disabled={isProcessing}
                >
                    Complete Run
                </button>
            </div>

            {error && (
                <p className="battle-actions__error" role="alert">
                    {error}
                </p>
            )}
        </section>
    )
}

export default BattleActions