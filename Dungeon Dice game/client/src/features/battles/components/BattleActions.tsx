import './BattleActions.css'

type ProcessingAction = 'new-battle' | 'complete' | 'abandon' | null

interface BattleActionsProps {
    isBattleResolved: boolean
    processingAction: ProcessingAction
    error: string | null
    onStartNewBattle: () => void
    onCompleteRun: () => void
    onAbandonRun: () => void
}

function BattleActions({
    isBattleResolved,
    processingAction,
    error,
    onStartNewBattle,
    onCompleteRun,
    onAbandonRun,
}: BattleActionsProps) {
    const isProcessing = processingAction !== null

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
                    aria-busy={processingAction === 'new-battle'}
                >
                    {processingAction === 'new-battle' && (
                        <span
                            className="loading-spinner loading-spinner--small"
                            aria-hidden="true"
                        />
                    )}

                    {processingAction === 'new-battle'
                        ? 'Starting New Battle…'
                        : 'Start New Battle'}
                </button>
            )}

            <div className="battle-actions__run-controls">
                <button
                    type="button"
                    className="battle-actions__button battle-actions__button--danger"
                    onClick={onAbandonRun}
                    disabled={isProcessing}
                    aria-busy={processingAction === 'abandon'}
                >
                    {processingAction === 'abandon' && (
                        <span
                            className="loading-spinner loading-spinner--small"
                            aria-hidden="true"
                        />
                    )}

                    {processingAction === 'abandon'
                        ? 'Abandoning Run…'
                        : 'Abandon Run'}
                </button>

                <button
                    type="button"
                    className="battle-actions__button battle-actions__button--gold"
                    onClick={onCompleteRun}
                    disabled={isProcessing}
                    aria-busy={processingAction === 'complete'}
                >
                    {processingAction === 'complete' && (
                        <span
                            className="loading-spinner loading-spinner--small"
                            aria-hidden="true"
                        />
                    )}

                    {processingAction === 'complete'
                        ? 'Completing Run…'
                        : 'Complete Run'}
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