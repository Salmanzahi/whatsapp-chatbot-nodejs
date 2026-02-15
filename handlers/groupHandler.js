// export async function handleGroupEvents(sock, update) {
//   try {
//     const { id, participants, action } = update;

//     // Handle different group actions
//     switch (action) {
//       case "add":
//         // Welcome new members
//         for (const participant of participants) {
//           const welcomeMessage = `👋 Welcome to the group, @${participant.split("@")[0]}!\n\nType !help to see available commands.`;

//           await sock.sendMessage(id, {
//             text: welcomeMessage,
//             mentions: [participant],
//           });
//         }
//         console.log(
//           `✅ Welcomed ${participants.length} new member(s) to group`,
//         );
//         break;

//       case "remove":
//         // Goodbye message
//         for (const participant of participants) {
//           const goodbyeMessage = `👋 Goodbye @${participant.split("@")[0]}!`;

//           await sock.sendMessage(id, {
//             text: goodbyeMessage,
//             mentions: [participant],
//           });
//         }
//         console.log(`👋 Said goodbye to ${participants.length} member(s)`);
//         break;

//       case "promote":
//         // Admin promotion
//         for (const participant of participants) {
//           await sock.sendMessage(id, {
//             text: `🎉 Congratulations @${participant.split("@")[0]}! You are now an admin!`,
//             mentions: [participant],
//           });
//         }
//         break;

//       case "demote":
//         // Admin demotion
//         for (const participant of participants) {
//           await sock.sendMessage(id, {
//             text: `📉 @${participant.split("@")[0]} is no longer an admin.`,
//             mentions: [participant],
//           });
//         }
//         break;
//     }
//   } catch (error) {
//     console.error("❌ Error handling group event:", error);
//   }
// }
