import type { Session, SessionData } from 'express-session';

type AppSession = Session & Partial<SessionData>

export class SessionService {
    create(session: AppSession, userId: number): Promise<void> {
        return new Promise((resolve, reject) => {
            session.regenerate((error) => {
                if (error) {
                    reject(error);
                    return;
                }

                session.userId = userId;

                session.save((saveError) => {
                    if (saveError) {
                        reject(saveError);
                        return;
                    }

                    resolve();
                });
            });
        });
    }

    destroy(session: Session): Promise<void> {
        return new Promise((resolve, reject) => {
            session.destroy((error) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve();
            });
        });
    }
}