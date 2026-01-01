import Docker from 'dockerode';
import { exec } from 'child_process';
import util from 'util';
import path from 'path';

const execAsync = util.promisify(exec);

const defaultSocket = process.platform === 'darwin'
    ? `${process.env.HOME}/.docker/run/docker.sock`
    : '/var/run/docker.sock';

const docker = new Docker({ socketPath: defaultSocket });
const CONTAINER_NAME = 'palworld-server';

export class DockerService {
    async getContainer() {
        const containers = await docker.listContainers({ all: true });
        const containerInfo = containers.find(c => c.Names.some(n => n.includes(CONTAINER_NAME)));
        if (!containerInfo) return null;
        return docker.getContainer(containerInfo.Id);
    }

    async getStatus(): Promise<string> {
        try {
            const container = await this.getContainer();
            if (!container) return 'not-found';
            const inspect = await container.inspect();
            return inspect.State.Status;
        } catch (error) {
            console.error('Error getting status:', error);
            return 'error';
        }
    }

    async start() {
        const container = await this.getContainer();

        if (!container) {
            console.log('Container not found, creating via docker compose...');
            try {
                // Running from backend/ directory
                await execAsync('docker compose -f ../docker-compose.yml up -d');
                return;
            } catch (error) {
                console.error('Failed to run docker compose:', error);
                throw new Error(`Failed to create container: ${error}`);
            }
        }

        const status = await this.getStatus();
        if (status === 'running') return;

        await container.start();
    }

    async stop() {
        const container = await this.getContainer();
        if (!container) throw new Error('Container not found');
        await container.stop();
    }
}
