import { readdir, readFile, writeFile, access, rm, mkdir } from 'fs/promises';
import { spawn } from "child_process";
import { v2 as compose } from 'docker-compose';
import  path from 'path';
import { EventEmitter } from 'node:events';
import type { WORKSPACE } from './types'
import { dev } from '$app/environment';
import { uuid } from 'uuidv4';
import domains from '../domains.json'
import { parse } from 'yaml'
import { Mutex } from 'async-mutex';

const rootPath = dev ? '../server/workspaces': "/workspaces"

console.log(rootPath)

export const allSubdomains: Record<string, string> = domains;

const allSubdomainsNames = Object.values(allSubdomains)

let availableSubdomains = new Set([...allSubdomainsNames])

async function getAllSubdomainsInUse(){
    const state = await getStates()
    const ports: number[] = []
    for(let s of state){
        if(s.services.length > 0){
            let _ports = s.services.map(x => x.ports).flat().map(x => x.exposed.port)
            ports.concat(_ports)
        }
    }
    return ports.reduce((ret, p) => {
        ret.push(allSubdomains[`${p}`])
        return ret
    }, [] as string[])
}

async function updateAllSubdomainsAvailable(){
    const inUse = await getAllSubdomainsInUse()
    const diff = allSubdomainsNames.filter(x => !inUse.includes(x));
    availableSubdomains = new Set(diff)
}

updateAllSubdomainsAvailable()

function getPortFromSubdomain(subdomain: string){
    return Object.keys(allSubdomains).find(key => allSubdomains[key] === subdomain);
}

function getSubdomain(){
    const [first] = availableSubdomains;
    if(first){
        availableSubdomains.delete(first)
        return getPortFromSubdomain(first)
    }else{
        return undefined
    }
}

export const workspaceEmitter = new EventEmitter();

async function _cmd(command: string[], workspace: string, env?: Record<string, string|undefined>) {
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

async function read(source: string){
    return await readFile(source, "utf8")
}

async function readReadme(name: string){
    return await read(`${name}/README`)
}

async function readSpecification(name: string){
    return await read(`${name}/docker-compose.yml`)
}

async function write(dest: string, txt: string){
    await writeFile(dest, txt, "utf8")
}

async function writeReadme(name: string, txt: string){
    await write(`${name}/README`, txt)
}

async function writeSpecification(name: string, txt: string){
    await write(`${name}/docker-compose.yml`, txt)
}

/// WORKSPACE

export async function isValidConfig(name: string){
    return await cmd("config", name)
}

const getWorkspaces = async (source: string) =>
  (await readdir(source, { withFileTypes: true }))
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

export async function getStates(){    
    const dirs = await getWorkspaces(rootPath)
    
    const states = await Promise.all(
        dirs.map(async (name) => {
            return await getWorkspaceState(name)
        })
    )
    return states
}

const getWorkspaceState = async (workspace: string) => {
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

async function getWorkspace(name: string){
    const readme = await readReadme(name)
    const specification = await readSpecification(name)
    return {readme, specification}
}

async function isWorkspace(name: string){
    try{
        await access(name)
        return true
    }catch{
        return false
    }
}

export function getEnv(ports: string[]){
    const envs = ports.map(p => parsePort(p)).filter(x => x !== "").map(x => x?.slice(1))
    const ret: Record<string, string|undefined> = {}
    envs.forEach(k => {
        ret[k] = getSubdomain()
    })
    return ret
}

const patt = /\$[A-H]/

export function parsePort(p: string){
    const v = patt.exec(p)
    if(v !== null) return v[0]
    else return ""
}

const mutex = new Mutex();

export async function upWorkspace(workspace: string){
    return await mutex.runExclusive(async () => _upWorkspace(workspace))
}

export async function downWorkspace(workspace: string, options?: string[]){
    return await mutex.runExclusive(async () => _downWorkspace(workspace, options))
}

export async function _upWorkspace(workspace: string){
    const p = `${rootPath}/${workspace}`
    const specification = await readSpecification(p)
    const j = parse(specification) as {services: {ports: string[]}[]}
    await updateAllSubdomainsAvailable()
    const _env = Object.values(j.services).map((x) => getEnv(x.ports))
    const env = Object.assign({}, ..._env)
    const ret = await cmd('up', p, [], env)
    //await updateAllSubdomainsAvailable()
    return ret
}

export async function cloneAndUpWorkspace(workspace: string){
    const p = `${rootPath}/${workspace}`
    const readme = await readReadme(p)
    const specification = await readSpecification(p)
    const tmp = uuid()
    const cloned = `${rootPath}/${workspace}_tmp_${tmp}`
    await createWorkspace(cloned, readme, specification)
    return await cmd('up', cloned)
}

export async function _downWorkspace(workspace: string, options?: string[]){
    const ret = await cmd('down', `${rootPath}/${workspace}`, options)
    await updateAllSubdomainsAvailable()
    return ret
}

async function isRunning(name: string){
    const ps = await getWorkspaceState(name)
    return ps.services.length > 0
}

async function createWorkspace(name: string, readme: string, specification: string){
    await mkdir(name)
    await writeReadme(name, readme)
    await writeSpecification(name, specification)
    return {done: true}
}

export async function saveWorkspace(name: string, readme: string, specification: string){
    const p = `${rootPath}/${name}`
    const isDir = await isWorkspace(p)
    if(!isDir){
        return await createWorkspace(p, readme, specification)
    }else{
        if(await isRunning(name)) throw "Workspace is running"
        await writeReadme(p, readme)
        await writeSpecification(p, specification)
        return {done: true} 
    }
}

export async function deleteWorkspace(name: string){
    const p = `${rootPath}/${name}`
    if(!isWorkspace(p)) throw "Workspace doesn't exist"
    await downWorkspace(name, ["-v"])
    await rm(p, { recursive: true, force: true });
    return {done: true}
}

/// END WORKSPACE
