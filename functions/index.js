const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

exports.resetTasksWeekly = functions.pubsub
    .schedule("0 0 * * 0") // domingo 00:00
    .timeZone("America/Sao_Paulo")
    .onRun(async () => {
        try {
            const usuariosSnap = await db.collection("usuarios").get();

            for (const userDoc of usuariosSnap.docs) {
                const tasksSnap = await db
                    .collection("usuarios")
                    .doc(userDoc.id)
                    .collection("tasks")
                    .get();

                const batch = db.batch();

                tasksSnap.forEach(taskDoc => {
                    batch.update(taskDoc.ref, {
                        done: false,
                        completedAt: null
                    });
                });

                batch.update(userDoc.ref, {
                    lastReset: new Date().toISOString().split("T")[0]
                });

                await batch.commit();
            }

            console.log("✅ Reset semanal concluído");
            return null;
        } catch (err) {
            console.error("❌ Erro no reset semanal:", err);
            return null;
        }
    });
