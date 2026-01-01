import { Rcon } from 'rcon-client';

const RCON_HOST = 'localhost';
const RCON_PORT = 25575;
const RCON_PASSWORD = 'adminpassword123';

export class RconService {
    private async execute(command: string): Promise<string> {
        const rcon = new Rcon({
            host: RCON_HOST,
            port: RCON_PORT,
            password: RCON_PASSWORD
        });

        try {
            await rcon.connect();
            const response = await rcon.send(command);
            await rcon.end();
            return response;
        } catch (error) {
            // console.error('RCON Error:', error);
            // Don't throw always, maybe server is down
            throw error;
        }
    }

    async save() {
        return this.execute('Save');
    }

    async shutdown(seconds: number = 10, message: string = 'Server_Stopping...') {
        return this.execute(`Shutdown ${seconds} ${message}`);
    }

    async broadcast(message: string) {
        return this.execute(`Broadcast ${message.replace(/ /g, '_')}`);
    }

    async info() {
        return this.execute('Info');
    }
}
