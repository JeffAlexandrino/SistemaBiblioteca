class NotificationObserver {
    update(event, data) {
        if (event === "loan_created") {
            console.log(`\n>>> [NOTIFICAÇÃO] E-mail enviado para ${data.usuario}: Empréstimo do livro ID ${data.livro_id} confirmado!\n`);
        }
    }
}

module.exports = NotificationObserver;