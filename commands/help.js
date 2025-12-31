import { commands } from './index.js';

export default {
    name: 'help',
    aliases: ['h', 'commands'],
    description: 'Show all available commands',
    usage: '!help [command]',
    
    async execute(sock, msg, args, context) {
        // If a specific command is requested
        if (args.length > 0) {
            const commandName = args[0].toLowerCase();
            const command = commands.find(cmd => 
                cmd.name === commandName || cmd.aliases?.includes(commandName)
            );

            if (!command) {
                await sock.sendMessage(context.from, {
                    text: `❌ Command "${commandName}" not found!`
                });
                return;
            }

            const helpText = `
📖 *Command Help*

*Name:* ${command.name}
*Aliases:* ${command.aliases?.join(', ') || 'None'}
*Description:* ${command.description}
*Usage:* ${command.usage}
${command.groupOnly ? '\n⚠️ *Group Only*' : ''}
            `.trim();

            await sock.sendMessage(context.from, { text: helpText });
            return;
        }

        // Show all commands
        let helpText = `
🤖 *WhatsApp Bot Commands*

Available commands:

`;

        commands.forEach(cmd => {
            helpText += `\n*!${cmd.name}*`;
            if (cmd.aliases?.length > 0) {
                helpText += ` (${cmd.aliases.join(', ')})`;
            }
            helpText += `\n└ ${cmd.description}\n`;
        });

        helpText += `\n💡 Type *!help <command>* for detailed info about a command.`;

        await sock.sendMessage(context.from, { text: helpText });
    }
};
