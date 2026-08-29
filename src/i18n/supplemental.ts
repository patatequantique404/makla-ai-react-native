import type { AppLanguage } from './index';

type Dictionary = Record<string, string>;

const fr: Dictionary = {
  'essai day singulier': '1 jour offert, puis', 'essai day pluriel': '%{count} jours offerts, puis',
  'essai week singulier': '1 semaine offerte, puis', 'essai week pluriel': '%{count} semaines offertes, puis',
  'essai month singulier': '1 mois offert, puis', 'essai month pluriel': '%{count} mois offerts, puis',
  'essai year singulier': '1 an offert, puis', 'essai year pluriel': '%{count} ans offerts, puis',
};

const en: Dictionary = {
  'Accès Pro': 'Pro Access',
  'Accès Pro actif': 'Pro access active',
  'Accès Pro activé sur ce téléphone.': 'Pro access activated on this phone.',
  'Accès caméra requis': 'Camera access required',
  'Accès web déconnecté.': 'Web access disconnected.',
  'Analyse du repas...': 'Analyzing meal...',
  'Assistance': 'Support',
  'Bravo ! La régularité est la clé, et vous y arrivez !': "Great job! Consistency is key, and you're doing it!",
  "Cet accès Pro ne peut être utilisé que sur un seul téléphone. Contacte le support si tu changes d'appareil.": 'This Pro access can only be used on one phone. Contact support if you change devices.',
  'Cette action est définitive.': 'This action cannot be undone.',
  'Connecter mon accès': 'Connect my access',
  'Connecter mon accès Pro': 'Connect my Pro access',
  'Connexion impossible': 'Unable to sign in',
  'Des rappels discrets au petit-déjeuner, au déjeuner et au dîner.': 'Gentle reminders at breakfast, lunch, and dinner.',
  'Déconnecter cet accès': 'Disconnect this access',
  'Déjà Pro': 'Already Pro',
  'Enregistre ton poids actuel pour mettre à jour le graphique.': 'Log your current weight to update the chart.',
  "Entre l'email utilisé au paiement sur le site. Ton accès Pro sera lié automatiquement à ce téléphone.": 'Enter the email used to pay on the website. Your Pro access will be linked to this phone automatically.',
  'Garde ton rythme': 'Stay on track',
  'Impossible de connecter cet email.': 'Unable to connect this email.',
  'La connexion Apple est disponible sur iPhone.': 'Sign in with Apple is available on iPhone.',
  'La restauration n’a pas pu être effectuée.': 'The restore could not be completed.',
  'Le résultat sera ajouté automatiquement au journal.': 'The result will be added to your journal automatically.',
  'Les repas seront supprimés de cet appareil.': 'Meals will be deleted from this device.',
  'Moyenne quotidienne de calories': 'Daily calorie average',
  'Moyennes des macros': 'Macro averages',
  'Photo impossible': 'Could not take photo',
  'Place ton repas dans le cadre': 'Place your meal inside the frame',
  'Poids actuel': 'Current weight',
  'Prends une photo, Makla AI ajoute les calories automatiquement.': 'Take a photo and Makla AI will add the calories automatically.',
  'Réessaie avec une photo plus nette.': 'Try again with a clearer photo.',
  'Supprimer ce repas ?': 'Delete this meal?',
  'Unités': 'Units',
  "Vue d'ensemble": 'Overview',
  'Vue d’ensemble de ton programme': 'Your program overview',
  'an': 'year',
  'calories': 'calories',
  'de l’objectif': 'of goal',
  'gluc.': 'carbs',
  'lip.': 'fat',
  'mois': 'months',
  'offerts, puis': 'free, then',
  'prot.': 'protein',
  'semaine': 'week',
  'soit': 'equivalent to',
  'ton plan est prêt': 'your plan is ready',
  'Économise': 'Save',
  'Faible': 'Low',
  'Élevée': 'High',
  'Modérée': 'Moderate',
  'essai day singulier': '1 day free, then', 'essai day pluriel': '%{count} days free, then',
  'essai week singulier': '1 week free, then', 'essai week pluriel': '%{count} weeks free, then',
  'essai month singulier': '1 month free, then', 'essai month pluriel': '%{count} months free, then',
  'essai year singulier': '1 year free, then', 'essai year pluriel': '%{count} years free, then',
};

const es: Dictionary = {
  'Accès Pro': 'Acceso Pro', 'Accès Pro actif': 'Acceso Pro activo', 'Accès Pro activé sur ce téléphone.': 'Acceso Pro activado en este teléfono.', 'Accès caméra requis': 'Se requiere acceso a la cámara', 'Accès web déconnecté.': 'Acceso web desconectado.',
  'Analyse du repas...': 'Analizando comida...', 'Assistance': 'Ayuda', 'Bravo ! La régularité est la clé, et vous y arrivez !': '¡Muy bien! La constancia es la clave y lo estás logrando.', "Cet accès Pro ne peut être utilisé que sur un seul téléphone. Contacte le support si tu changes d'appareil.": 'Este acceso Pro solo puede usarse en un teléfono. Contacta con soporte si cambias de dispositivo.', 'Cette action est définitive.': 'Esta acción no se puede deshacer.',
  'Connecter mon accès': 'Conectar mi acceso', 'Connecter mon accès Pro': 'Conectar mi acceso Pro', 'Connexion impossible': 'No se pudo iniciar sesión', 'Des rappels discrets au petit-déjeuner, au déjeuner et au dîner.': 'Recordatorios discretos en el desayuno, el almuerzo y la cena.', 'Déconnecter cet accès': 'Desconectar este acceso', 'Déjà Pro': 'Ya soy Pro',
  'Enregistre ton poids actuel pour mettre à jour le graphique.': 'Registra tu peso actual para actualizar el gráfico.', "Entre l'email utilisé au paiement sur le site. Ton accès Pro sera lié automatiquement à ce téléphone.": 'Introduce el correo usado para pagar en el sitio web. Tu acceso Pro se vinculará automáticamente a este teléfono.', 'Garde ton rythme': 'Mantén el ritmo', 'Impossible de connecter cet email.': 'No se pudo conectar este correo.', 'La connexion Apple est disponible sur iPhone.': 'Iniciar sesión con Apple está disponible en iPhone.', 'La restauration n’a pas pu être effectuée.': 'No se pudo restaurar.',
  'Le résultat sera ajouté automatiquement au journal.': 'El resultado se añadirá automáticamente a tu diario.', 'Les repas seront supprimés de cet appareil.': 'Las comidas se eliminarán de este dispositivo.', 'Moyenne quotidienne de calories': 'Promedio diario de calorías', 'Moyennes des macros': 'Promedios de macros', 'Photo impossible': 'No se pudo tomar la foto', 'Place ton repas dans le cadre': 'Coloca tu comida dentro del marco', 'Poids actuel': 'Peso actual', 'Prends une photo, Makla AI ajoute les calories automatiquement.': 'Haz una foto y Makla AI añadirá las calorías automáticamente.', 'Réessaie avec une photo plus nette.': 'Inténtalo de nuevo con una foto más nítida.', 'Supprimer ce repas ?': '¿Eliminar esta comida?', 'Unités': 'Unidades', "Vue d'ensemble": 'Resumen', 'Vue d’ensemble de ton programme': 'Resumen de tu programa',
  'an': 'año', 'calories': 'calorías', 'de l’objectif': 'del objetivo', 'gluc.': 'carb.', 'lip.': 'grasas', 'mois': 'meses', 'offerts, puis': 'gratis, después', 'prot.': 'proteína', 'semaine': 'semana', 'soit': 'equivale a', 'ton plan est prêt': 'tu plan está listo', 'Économise': 'Ahorra', 'Faible': 'Baja', 'Élevée': 'Alta', 'Modérée': 'Moderada',
  'essai day singulier': '1 día gratis, después', 'essai day pluriel': '%{count} días gratis, después', 'essai week singulier': '1 semana gratis, después', 'essai week pluriel': '%{count} semanas gratis, después', 'essai month singulier': '1 mes gratis, después', 'essai month pluriel': '%{count} meses gratis, después', 'essai year singulier': '1 año gratis, después', 'essai year pluriel': '%{count} años gratis, después',
};

const de: Dictionary = {
  'Accès Pro': 'Pro-Zugang', 'Accès Pro actif': 'Pro-Zugang aktiv', 'Accès Pro activé sur ce téléphone.': 'Pro-Zugang auf diesem Telefon aktiviert.', 'Accès caméra requis': 'Kamerazugriff erforderlich', 'Accès web déconnecté.': 'Webzugang getrennt.',
  'Analyse du repas...': 'Mahlzeit wird analysiert...', 'Assistance': 'Support', 'Bravo ! La régularité est la clé, et vous y arrivez !': 'Stark! Beständigkeit ist der Schlüssel und du bleibst dran.', "Cet accès Pro ne peut être utilisé que sur un seul téléphone. Contacte le support si tu changes d'appareil.": 'Dieser Pro-Zugang kann nur auf einem Telefon verwendet werden. Kontaktiere den Support, wenn du das Gerät wechselst.', 'Cette action est définitive.': 'Diese Aktion kann nicht rückgängig gemacht werden.',
  'Connecter mon accès': 'Zugang verbinden', 'Connecter mon accès Pro': 'Pro-Zugang verbinden', 'Connexion impossible': 'Anmeldung nicht möglich', 'Des rappels discrets au petit-déjeuner, au déjeuner et au dîner.': 'Dezente Erinnerungen zum Frühstück, Mittag- und Abendessen.', 'Déconnecter cet accès': 'Diesen Zugang trennen', 'Déjà Pro': 'Bereits Pro',
  'Enregistre ton poids actuel pour mettre à jour le graphique.': 'Trage dein aktuelles Gewicht ein, um das Diagramm zu aktualisieren.', "Entre l'email utilisé au paiement sur le site. Ton accès Pro sera lié automatiquement à ce téléphone.": 'Gib die beim Kauf auf der Website verwendete E-Mail-Adresse ein. Dein Pro-Zugang wird automatisch mit diesem Telefon verknüpft.', 'Garde ton rythme': 'Bleib im Rhythmus', 'Impossible de connecter cet email.': 'Diese E-Mail-Adresse konnte nicht verbunden werden.', 'La connexion Apple est disponible sur iPhone.': 'Mit Apple anmelden ist auf dem iPhone verfügbar.', 'La restauration n’a pas pu être effectuée.': 'Die Wiederherstellung konnte nicht abgeschlossen werden.',
  'Le résultat sera ajouté automatiquement au journal.': 'Das Ergebnis wird automatisch deinem Tagebuch hinzugefügt.', 'Les repas seront supprimés de cet appareil.': 'Die Mahlzeiten werden von diesem Gerät gelöscht.', 'Moyenne quotidienne de calories': 'Täglicher Kaloriendurchschnitt', 'Moyennes des macros': 'Makro-Durchschnitt', 'Photo impossible': 'Foto konnte nicht aufgenommen werden', 'Place ton repas dans le cadre': 'Platziere deine Mahlzeit im Rahmen', 'Poids actuel': 'Aktuelles Gewicht', 'Prends une photo, Makla AI ajoute les calories automatiquement.': 'Mache ein Foto und Makla AI fügt die Kalorien automatisch hinzu.', 'Réessaie avec une photo plus nette.': 'Versuche es mit einem schärferen Foto erneut.', 'Supprimer ce repas ?': 'Diese Mahlzeit löschen?', 'Unités': 'Einheiten', "Vue d'ensemble": 'Übersicht', 'Vue d’ensemble de ton programme': 'Deine Programmübersicht',
  'an': 'Jahr', 'calories': 'Kalorien', 'de l’objectif': 'des Ziels', 'gluc.': 'Kohlenh.', 'lip.': 'Fett', 'mois': 'Monate', 'offerts, puis': 'kostenlos, danach', 'prot.': 'Protein', 'semaine': 'Woche', 'soit': 'entspricht', 'ton plan est prêt': 'dein Plan ist fertig', 'Économise': 'Spare', 'Faible': 'Niedrig', 'Élevée': 'Hoch', 'Modérée': 'Mittel',
  'essai day singulier': '1 Tag kostenlos, danach', 'essai day pluriel': '%{count} Tage kostenlos, danach', 'essai week singulier': '1 Woche kostenlos, danach', 'essai week pluriel': '%{count} Wochen kostenlos, danach', 'essai month singulier': '1 Monat kostenlos, danach', 'essai month pluriel': '%{count} Monate kostenlos, danach', 'essai year singulier': '1 Jahr kostenlos, danach', 'essai year pluriel': '%{count} Jahre kostenlos, danach',
};

const it: Dictionary = {
  'Accès Pro': 'Accesso Pro', 'Accès Pro actif': 'Accesso Pro attivo', 'Accès Pro activé sur ce téléphone.': 'Accesso Pro attivato su questo telefono.', 'Accès caméra requis': 'Accesso alla fotocamera richiesto', 'Accès web déconnecté.': 'Accesso web disconnesso.',
  'Analyse du repas...': 'Analisi del pasto...', 'Assistance': 'Assistenza', 'Bravo ! La régularité est la clé, et vous y arrivez !': 'Ottimo! La costanza è la chiave e ce la stai facendo.', "Cet accès Pro ne peut être utilisé que sur un seul téléphone. Contacte le support si tu changes d'appareil.": "Questo accesso Pro può essere usato su un solo telefono. Contatta l'assistenza se cambi dispositivo.", 'Cette action est définitive.': 'Questa azione non può essere annullata.',
  'Connecter mon accès': 'Collega il mio accesso', 'Connecter mon accès Pro': 'Collega il mio accesso Pro', 'Connexion impossible': 'Accesso non riuscito', 'Des rappels discrets au petit-déjeuner, au déjeuner et au dîner.': 'Promemoria discreti a colazione, pranzo e cena.', 'Déconnecter cet accès': 'Scollega questo accesso', 'Déjà Pro': 'Già Pro',
  'Enregistre ton poids actuel pour mettre à jour le graphique.': 'Registra il tuo peso attuale per aggiornare il grafico.', "Entre l'email utilisé au paiement sur le site. Ton accès Pro sera lié automatiquement à ce téléphone.": "Inserisci l'email usata per il pagamento sul sito. L'accesso Pro verrà collegato automaticamente a questo telefono.", 'Garde ton rythme': 'Mantieni il ritmo', 'Impossible de connecter cet email.': 'Impossibile collegare questa email.', 'La connexion Apple est disponible sur iPhone.': 'Accedi con Apple è disponibile su iPhone.', 'La restauration n’a pas pu être effectuée.': 'Impossibile completare il ripristino.',
  'Le résultat sera ajouté automatiquement au journal.': 'Il risultato verrà aggiunto automaticamente al diario.', 'Les repas seront supprimés de cet appareil.': 'I pasti verranno eliminati da questo dispositivo.', 'Moyenne quotidienne de calories': 'Media calorica giornaliera', 'Moyennes des macros': 'Medie dei macro', 'Photo impossible': 'Impossibile scattare la foto', 'Place ton repas dans le cadre': 'Posiziona il pasto nel riquadro', 'Poids actuel': 'Peso attuale', 'Prends une photo, Makla AI ajoute les calories automatiquement.': 'Scatta una foto e Makla AI aggiungerà automaticamente le calorie.', 'Réessaie avec une photo plus nette.': 'Riprova con una foto più nitida.', 'Supprimer ce repas ?': 'Eliminare questo pasto?', 'Unités': 'Unità', "Vue d'ensemble": 'Panoramica', 'Vue d’ensemble de ton programme': 'Panoramica del tuo programma',
  'an': 'anno', 'calories': 'calorie', 'de l’objectif': "dell'obiettivo", 'gluc.': 'carb.', 'lip.': 'grassi', 'mois': 'mesi', 'offerts, puis': 'gratis, poi', 'prot.': 'proteine', 'semaine': 'settimana', 'soit': 'equivale a', 'ton plan est prêt': 'il tuo piano è pronto', 'Économise': 'Risparmia', 'Faible': 'Bassa', 'Élevée': 'Alta', 'Modérée': 'Moderata',
  'essai day singulier': '1 giorno gratis, poi', 'essai day pluriel': '%{count} giorni gratis, poi', 'essai week singulier': '1 settimana gratis, poi', 'essai week pluriel': '%{count} settimane gratis, poi', 'essai month singulier': '1 mese gratis, poi', 'essai month pluriel': '%{count} mesi gratis, poi', 'essai year singulier': '1 anno gratis, poi', 'essai year pluriel': '%{count} anni gratis, poi',
};

const ptBR: Dictionary = {
  'Accès Pro': 'Acesso Pro', 'Accès Pro actif': 'Acesso Pro ativo', 'Accès Pro activé sur ce téléphone.': 'Acesso Pro ativado neste telefone.', 'Accès caméra requis': 'Acesso à câmera necessário', 'Accès web déconnecté.': 'Acesso web desconectado.',
  'Analyse du repas...': 'Analisando refeição...', 'Assistance': 'Suporte', 'Bravo ! La régularité est la clé, et vous y arrivez !': 'Muito bem! Consistência é a chave, e você está conseguindo.', "Cet accès Pro ne peut être utilisé que sur un seul téléphone. Contacte le support si tu changes d'appareil.": 'Este acesso Pro só pode ser usado em um telefone. Fale com o suporte se trocar de aparelho.', 'Cette action est définitive.': 'Esta ação não pode ser desfeita.',
  'Connecter mon accès': 'Conectar meu acesso', 'Connecter mon accès Pro': 'Conectar meu acesso Pro', 'Connexion impossible': 'Não foi possível entrar', 'Des rappels discrets au petit-déjeuner, au déjeuner et au dîner.': 'Lembretes discretos no café da manhã, almoço e jantar.', 'Déconnecter cet accès': 'Desconectar este acesso', 'Déjà Pro': 'Já sou Pro',
  'Enregistre ton poids actuel pour mettre à jour le graphique.': 'Registre seu peso atual para atualizar o gráfico.', "Entre l'email utilisé au paiement sur le site. Ton accès Pro sera lié automatiquement à ce téléphone.": 'Digite o e-mail usado no pagamento pelo site. Seu acesso Pro será vinculado automaticamente a este telefone.', 'Garde ton rythme': 'Mantenha o ritmo', 'Impossible de connecter cet email.': 'Não foi possível conectar este e-mail.', 'La connexion Apple est disponible sur iPhone.': 'Iniciar sessão com a Apple está disponível no iPhone.', 'La restauration n’a pas pu être effectuée.': 'Não foi possível concluir a restauração.',
  'Le résultat sera ajouté automatiquement au journal.': 'O resultado será adicionado automaticamente ao diário.', 'Les repas seront supprimés de cet appareil.': 'As refeições serão excluídas deste aparelho.', 'Moyenne quotidienne de calories': 'Média diária de calorias', 'Moyennes des macros': 'Médias dos macros', 'Photo impossible': 'Não foi possível tirar a foto', 'Place ton repas dans le cadre': 'Posicione sua refeição dentro do quadro', 'Poids actuel': 'Peso atual', 'Prends une photo, Makla AI ajoute les calories automatiquement.': 'Tire uma foto e o Makla AI adicionará as calorias automaticamente.', 'Réessaie avec une photo plus nette.': 'Tente novamente com uma foto mais nítida.', 'Supprimer ce repas ?': 'Excluir esta refeição?', 'Unités': 'Unidades', "Vue d'ensemble": 'Visão geral', 'Vue d’ensemble de ton programme': 'Visão geral do seu programa',
  'an': 'ano', 'calories': 'calorias', 'de l’objectif': 'da meta', 'gluc.': 'carb.', 'lip.': 'gord.', 'mois': 'meses', 'offerts, puis': 'grátis, depois', 'prot.': 'proteína', 'semaine': 'semana', 'soit': 'equivale a', 'ton plan est prêt': 'seu plano está pronto', 'Économise': 'Economize', 'Faible': 'Baixa', 'Élevée': 'Alta', 'Modérée': 'Moderada',
  'essai day singulier': '1 dia grátis, depois', 'essai day pluriel': '%{count} dias grátis, depois', 'essai week singulier': '1 semana grátis, depois', 'essai week pluriel': '%{count} semanas grátis, depois', 'essai month singulier': '1 mês grátis, depois', 'essai month pluriel': '%{count} meses grátis, depois', 'essai year singulier': '1 ano grátis, depois', 'essai year pluriel': '%{count} anos grátis, depois',
};

const nl: Dictionary = {
  'Accès Pro': 'Pro-toegang', 'Accès Pro actif': 'Pro-toegang actief', 'Accès Pro activé sur ce téléphone.': 'Pro-toegang geactiveerd op deze telefoon.', 'Accès caméra requis': 'Cameratoegang vereist', 'Accès web déconnecté.': 'Webtoegang losgekoppeld.',
  'Analyse du repas...': 'Maaltijd analyseren...', 'Assistance': 'Ondersteuning', 'Bravo ! La régularité est la clé, et vous y arrivez !': 'Goed bezig! Regelmaat is de sleutel en je houdt vol.', "Cet accès Pro ne peut être utilisé que sur un seul téléphone. Contacte le support si tu changes d'appareil.": 'Deze Pro-toegang kan maar op één telefoon worden gebruikt. Neem contact op met support als je van apparaat wisselt.', 'Cette action est définitive.': 'Deze actie kan niet ongedaan worden gemaakt.',
  'Connecter mon accès': 'Mijn toegang koppelen', 'Connecter mon accès Pro': 'Mijn Pro-toegang koppelen', 'Connexion impossible': 'Inloggen mislukt', 'Des rappels discrets au petit-déjeuner, au déjeuner et au dîner.': 'Subtiele herinneringen bij ontbijt, lunch en avondeten.', 'Déconnecter cet accès': 'Deze toegang loskoppelen', 'Déjà Pro': 'Al Pro',
  'Enregistre ton poids actuel pour mettre à jour le graphique.': 'Noteer je huidige gewicht om de grafiek bij te werken.', "Entre l'email utilisé au paiement sur le site. Ton accès Pro sera lié automatiquement à ce téléphone.": 'Voer het e-mailadres in waarmee je op de website hebt betaald. Je Pro-toegang wordt automatisch aan deze telefoon gekoppeld.', 'Garde ton rythme': 'Blijf op schema', 'Impossible de connecter cet email.': 'Dit e-mailadres kon niet worden gekoppeld.', 'La connexion Apple est disponible sur iPhone.': 'Log in met Apple is beschikbaar op iPhone.', 'La restauration n’a pas pu être effectuée.': 'Herstellen kon niet worden voltooid.',
  'Le résultat sera ajouté automatiquement au journal.': 'Het resultaat wordt automatisch aan je dagboek toegevoegd.', 'Les repas seront supprimés de cet appareil.': 'Maaltijden worden van dit apparaat verwijderd.', 'Moyenne quotidienne de calories': 'Dagelijks caloriegemiddelde', 'Moyennes des macros': 'Macrogemiddelden', 'Photo impossible': 'Foto maken mislukt', 'Place ton repas dans le cadre': 'Plaats je maaltijd binnen het kader', 'Poids actuel': 'Huidig gewicht', 'Prends une photo, Makla AI ajoute les calories automatiquement.': 'Maak een foto en Makla AI voegt de calorieën automatisch toe.', 'Réessaie avec une photo plus nette.': 'Probeer opnieuw met een scherpere foto.', 'Supprimer ce repas ?': 'Deze maaltijd verwijderen?', 'Unités': 'Eenheden', "Vue d'ensemble": 'Overzicht', 'Vue d’ensemble de ton programme': 'Overzicht van je programma',
  'an': 'jaar', 'calories': 'calorieën', 'de l’objectif': 'van doel', 'gluc.': 'koolh.', 'lip.': 'vet', 'mois': 'maanden', 'offerts, puis': 'gratis, daarna', 'prot.': 'eiwit', 'semaine': 'week', 'soit': 'oftewel', 'ton plan est prêt': 'je plan is klaar', 'Économise': 'Bespaar', 'Faible': 'Laag', 'Élevée': 'Hoog', 'Modérée': 'Gemiddeld',
  'essai day singulier': '1 dag gratis, daarna', 'essai day pluriel': '%{count} dagen gratis, daarna', 'essai week singulier': '1 week gratis, daarna', 'essai week pluriel': '%{count} weken gratis, daarna', 'essai month singulier': '1 maand gratis, daarna', 'essai month pluriel': '%{count} maanden gratis, daarna', 'essai year singulier': '1 jaar gratis, daarna', 'essai year pluriel': '%{count} jaar gratis, daarna',
};

const ar: Dictionary = {
  'Accès Pro': 'وصول Pro', 'Accès Pro actif': 'وصول Pro مفعّل', 'Accès Pro activé sur ce téléphone.': 'تم تفعيل وصول Pro على هذا الهاتف.', 'Accès caméra requis': 'يلزم السماح بالكاميرا', 'Accès web déconnecté.': 'تم فصل الوصول عبر الويب.',
  'Analyse du repas...': 'جارٍ تحليل الوجبة...', 'Assistance': 'الدعم', 'Bravo ! La régularité est la clé, et vous y arrivez !': 'أحسنت! الاستمرارية هي المفتاح وأنت تتقدم.', "Cet accès Pro ne peut être utilisé que sur un seul téléphone. Contacte le support si tu changes d'appareil.": 'يمكن استخدام وصول Pro هذا على هاتف واحد فقط. تواصل مع الدعم إذا غيّرت جهازك.', 'Cette action est définitive.': 'لا يمكن التراجع عن هذا الإجراء.',
  'Connecter mon accès': 'ربط وصولي', 'Connecter mon accès Pro': 'ربط وصول Pro', 'Connexion impossible': 'تعذر تسجيل الدخول', 'Des rappels discrets au petit-déjeuner, au déjeuner et au dîner.': 'تذكيرات لطيفة عند الإفطار والغداء والعشاء.', 'Déconnecter cet accès': 'فصل هذا الوصول', 'Déjà Pro': 'لدي Pro بالفعل',
  'Enregistre ton poids actuel pour mettre à jour le graphique.': 'سجّل وزنك الحالي لتحديث الرسم.', "Entre l'email utilisé au paiement sur le site. Ton accès Pro sera lié automatiquement à ce téléphone.": 'أدخل البريد الإلكتروني المستخدم للدفع على الموقع. سيتم ربط وصول Pro بهذا الهاتف تلقائيًا.', 'Garde ton rythme': 'حافظ على وتيرتك', 'Impossible de connecter cet email.': 'تعذر ربط هذا البريد الإلكتروني.', 'La connexion Apple est disponible sur iPhone.': 'تسجيل الدخول باستخدام Apple متاح على iPhone.', 'La restauration n’a pas pu être effectuée.': 'تعذرت استعادة المشتريات.',
  'Le résultat sera ajouté automatiquement au journal.': 'ستتم إضافة النتيجة إلى سجلك تلقائيًا.', 'Les repas seront supprimés de cet appareil.': 'سيتم حذف الوجبات من هذا الجهاز.', 'Moyenne quotidienne de calories': 'متوسط السعرات اليومي', 'Moyennes des macros': 'متوسط المغذيات الكبرى', 'Photo impossible': 'تعذر التقاط الصورة', 'Place ton repas dans le cadre': 'ضع وجبتك داخل الإطار', 'Poids actuel': 'الوزن الحالي', 'Prends une photo, Makla AI ajoute les calories automatiquement.': 'التقط صورة وسيضيف Makla AI السعرات تلقائيًا.', 'Réessaie avec une photo plus nette.': 'حاول مجددًا بصورة أوضح.', 'Supprimer ce repas ?': 'حذف هذه الوجبة؟', 'Unités': 'الوحدات', "Vue d'ensemble": 'نظرة عامة', 'Vue d’ensemble de ton programme': 'نظرة عامة على برنامجك',
  'an': 'سنة', 'calories': 'سعرات', 'de l’objectif': 'من الهدف', 'gluc.': 'كربوهيدرات', 'lip.': 'دهون', 'mois': 'أشهر', 'offerts, puis': 'مجانًا، ثم', 'prot.': 'بروتين', 'semaine': 'أسبوع', 'soit': 'ما يعادل', 'ton plan est prêt': 'خطتك جاهزة', 'Économise': 'وفّر', 'Faible': 'منخفض', 'Élevée': 'مرتفع', 'Modérée': 'متوسط',
  'essai day singulier': 'يوم واحد مجانًا، ثم', 'essai day pluriel': '%{count} أيام مجانًا، ثم', 'essai week singulier': 'أسبوع واحد مجانًا، ثم', 'essai week pluriel': '%{count} أسابيع مجانًا، ثم', 'essai month singulier': 'شهر واحد مجانًا، ثم', 'essai month pluriel': '%{count} أشهر مجانًا، ثم', 'essai year singulier': 'سنة واحدة مجانًا، ثم', 'essai year pluriel': '%{count} سنوات مجانًا، ثم',
};

const he: Dictionary = {
  'Accès Pro': 'גישת Pro', 'Accès Pro actif': 'גישת Pro פעילה', 'Accès Pro activé sur ce téléphone.': 'גישת Pro הופעלה בטלפון הזה.', 'Accès caméra requis': 'נדרשת גישה למצלמה', 'Accès web déconnecté.': 'הגישה מהאתר נותקה.',
  'Analyse du repas...': 'מנתח את הארוחה...', 'Assistance': 'תמיכה', 'Bravo ! La régularité est la clé, et vous y arrivez !': 'כל הכבוד! עקביות היא המפתח ואתם בדרך הנכונה.', "Cet accès Pro ne peut être utilisé que sur un seul téléphone. Contacte le support si tu changes d'appareil.": 'ניתן להשתמש בגישת Pro הזאת בטלפון אחד בלבד. יש לפנות לתמיכה בעת החלפת מכשיר.', 'Cette action est définitive.': 'לא ניתן לבטל פעולה זו.',
  'Connecter mon accès': 'חיבור הגישה שלי', 'Connecter mon accès Pro': 'חיבור גישת Pro', 'Connexion impossible': 'לא ניתן להתחבר', 'Des rappels discrets au petit-déjeuner, au déjeuner et au dîner.': 'תזכורות עדינות בארוחת הבוקר, הצהריים והערב.', 'Déconnecter cet accès': 'ניתוק הגישה הזאת', 'Déjà Pro': 'כבר Pro',
  'Enregistre ton poids actuel pour mettre à jour le graphique.': 'יש להזין את המשקל הנוכחי כדי לעדכן את הגרף.', "Entre l'email utilisé au paiement sur le site. Ton accès Pro sera lié automatiquement à ce téléphone.": 'יש להזין את כתובת האימייל ששימשה לתשלום באתר. גישת Pro תקושר אוטומטית לטלפון הזה.', 'Garde ton rythme': 'להישאר בקצב', 'Impossible de connecter cet email.': 'לא ניתן לקשר את כתובת האימייל הזאת.', 'La connexion Apple est disponible sur iPhone.': 'התחברות עם Apple זמינה ב-iPhone.', 'La restauration n’a pas pu être effectuée.': 'לא ניתן היה להשלים את השחזור.',
  'Le résultat sera ajouté automatiquement au journal.': 'התוצאה תתווסף אוטומטית ליומן.', 'Les repas seront supprimés de cet appareil.': 'הארוחות יימחקו מהמכשיר הזה.', 'Moyenne quotidienne de calories': 'ממוצע קלוריות יומי', 'Moyennes des macros': 'ממוצעי מאקרו', 'Photo impossible': 'לא ניתן לצלם', 'Place ton repas dans le cadre': 'יש למקם את הארוחה בתוך המסגרת', 'Poids actuel': 'משקל נוכחי', 'Prends une photo, Makla AI ajoute les calories automatiquement.': 'צלמו תמונה ו-Makla AI יוסיף את הקלוריות אוטומטית.', 'Réessaie avec une photo plus nette.': 'נסו שוב עם תמונה ברורה יותר.', 'Supprimer ce repas ?': 'למחוק את הארוחה הזאת?', 'Unités': 'יחידות', "Vue d'ensemble": 'סקירה', 'Vue d’ensemble de ton programme': 'סקירת התוכנית שלך',
  'an': 'שנה', 'calories': 'קלוריות', 'de l’objectif': 'מהיעד', 'gluc.': 'פחמימות', 'lip.': 'שומן', 'mois': 'חודשים', 'offerts, puis': 'חינם, ואז', 'prot.': 'חלבון', 'semaine': 'שבוע', 'soit': 'שווה ל־', 'ton plan est prêt': 'התוכנית שלך מוכנה', 'Économise': 'חיסכון', 'Faible': 'נמוכה', 'Élevée': 'גבוהה', 'Modérée': 'בינונית',
  'essai day singulier': 'יום אחד חינם, ואז', 'essai day pluriel': '%{count} ימים חינם, ואז', 'essai week singulier': 'שבוע אחד חינם, ואז', 'essai week pluriel': '%{count} שבועות חינם, ואז', 'essai month singulier': 'חודש אחד חינם, ואז', 'essai month pluriel': '%{count} חודשים חינם, ואז', 'essai year singulier': 'שנה אחת חינם, ואז', 'essai year pluriel': '%{count} שנים חינם, ואז',
};

export const supplementalTranslations: Record<AppLanguage, Dictionary> = { fr, en, es, de, it, 'pt-BR': ptBR, nl, ar, he };
