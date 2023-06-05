import { readdir, readFile, writeFile, access, rm, mkdir } from 'fs/promises';
import { spawn } from "child_process";
import { EventEmitter } from 'node:events';

export const workspaceEmitter = new EventEmitter();

async function read(source: string){
    return await readFile(source, "utf8")
}

export async function readReadme(name: string){
    return await read(`${name}/README`)
}

export async function readSpecification(name: string){
    return await read(`${name}/docker-compose.yml`)
}

export const getWorkspaces = async (source: string) =>
  (await readdir(source, { withFileTypes: true }))
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)


export async function _cmd(command: string[], workspace: string, env?: Record<string, string|undefined>) {
        try{
            let p = spawn(command[0], command.slice(1), { env, cwd: `${workspace}`});
                
            return new Promise((resolveFunc) => {
                p.stdout.on("data", (data: string) => {
                    workspaceEmitter.emit('log:out', data.toString())
                });
                p.stderr.on("data", (data: string) => {
                    workspaceEmitter.emit('log:err', data.toString())
                });
                p.on("exit", (code: number) => {
                    resolveFunc(code);
                });
            });
        }catch(err){
            return Promise.reject(new Error('fail on _cmd:' + command + ', ' + workspace));
        }
    }