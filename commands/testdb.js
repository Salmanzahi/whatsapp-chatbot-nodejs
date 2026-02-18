import { db } from "../firebase/setup";
import { collection, getDocs } from "firebase/firestore";

export default {
  name: "testdb",
  aliases: ["testdb"],
  description: "Test the database",
  usage: "!testdb",

  async execute(sock, msg, args, context) {
    const querySnapshot = await getDocs(collection(db, "users"));
    querySnapshot.forEach((doc) => {
      console.log(doc.id, " => ", doc.data());
    });

    await sock.sendMessage(context.from, {
      text: `Database tested successfully ${querySnapshot.size}`,
    });
  },
};
