import { readdir, readFile, writeFile, access, rm, mkdir } from 'fs/promises';
import { spawn } from "child_process";
import { EventEmitter } from 'node:events';
import { v2 as compose } from 'docker-compose';
import type { WORKSPACE } from './types';
import  path from 'path';
import { dev } from '$app/environment';
import domains from '../domains.json'

export const allSubdomains: Record<string, string> = domains;

export const allSubdomainsNames = Object.values(allSubdomains)

export const rootPath = dev ? '../server/workspaces': "/workspaces"

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

export const getWorkspaceNames = async (source: string) =>
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

export async function cmd(cmd: "ps" | "up" | "down" | "config", workspace: string, options?: string[], env?: Record<string, string|undefined>){
    if(cmd === 'ps' || cmd === 'config') return await cmdCompose(cmd, workspace, options)
    
    try{
        const result = await _cmd(['docker', 'compose', cmd, ...(options || [])], workspace, env)
        return { exitCode: 0, data: result}
    }catch(err){
        console.log(cmd, err)
        return { exitCode: 1, data: { services: [], error: JSON.stringify(err)}}
    }
}

export async function cmdCompose(cmd: "ps" | "upAll" | "down" | "config", workspace: string, options?: string[]){
    
    try{
        const res = await compose[cmd]({
            cwd: workspace,
            commandOptions: options
        })
        return res
    }
    catch(err){
        console.log(cmd, err)
        return { exitCode: 1, data: { services: [], error: JSON.stringify(err)}}
    }
}


export const getWorkspaceState = async (workspace: string) => {
    const p = path.join(rootPath, workspace)
    // @ts-ignore
    const services = (await cmd('ps', p)).data.services
    const readme = await readReadme(p)
    const specification = await readSpecification(p)
    const configError = (await cmd('config', p)).exitCode
    
    const ret: WORKSPACE = {
        workspace,
        readme,
        specification,
        isValid: configError === 0 ? true: false,
        services
    }

    return ret
}

async function write(dest: string, txt: string){
    await writeFile(dest, txt, "utf8")
}

export async function writeReadme(name: string, txt: string){
    await write(`${name}/README`, txt)
}

export async function writeSpecification(name: string, txt: string){
    await write(`${name}/docker-compose.yml`, txt)
}

export async function isValidConfig(name: string){
    return await cmd("config", name)
}

export async function isWorkspace(name: string){
    try{
        await access(name)
        return true
    }catch{
        return false
    }
}

export async function getAllSubdomainsInUse(state: WORKSPACE[]){
    let ports: number[] = []
    for(let s of state){
        if(s.services.length > 0){
            let _ports = s.services.map(x => x.ports).flat().map(x => x.exposed.port)
            ports = ports.concat(_ports)
        }
    }

    return ports.reduce((ret, p) => {
        ret.push(allSubdomains[`${p}`])
        return ret
    }, [] as string[])
}

export function getSubdomain(port: number){
    return allSubdomains[`${port}`]
}

export async function getAllSubdomainsAvailable(state: WORKSPACE[]){
    const inUse = await getAllSubdomainsInUse(state)
    const diff = allSubdomainsNames.filter(x => !inUse.includes(x));
    return diff 
}

const flip = (data: Record<string, string>) => Object.fromEntries(
    Object
      .entries(data)
      .map(([key, value]) => [value, key])
    );

function getPortFromSubdomain(subdomain: string){
    const fliped = flip(allSubdomains)
    return fliped[subdomain]
}

export function getEnv(ports: string[], available: string[]){
    const envs = ports.map(p => parsePort(p)).filter(x => x !== "").map(x => x?.slice(1))
    const ret: Record<string, string|undefined> = {}
    envs.forEach(async (k, i) => {
        ret[k] = getPortFromSubdomain(available[i])
    })
    return ret
}

const patt = /\$[A-H]/

export function parsePort(p: string){
    const v = patt.exec(p)
    if(v !== null) return v[0]
    else return ""
}