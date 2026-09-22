import type { Request } from 'express';
import type { Session } from 'express-session';

export class SessionService {
    create(req: Request, userId: number): Promise<void> {
        return new Promise((resolve, reject) => {
            req.session.regenerate((error) => {
                if (error) {
                    reject(error);
                    return;
                }

                req.session.userId = userId;
                delete req.session.runId;

                req.session.save((saveError) => {
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