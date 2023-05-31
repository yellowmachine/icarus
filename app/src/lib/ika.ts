import { readdir, readFile, writeFile, access, rm, mkdir } from 'fs/promises';
import { spawn } from "child_process";
import { v2 as compose } from 'docker-compose';
import  path from 'path';
// @ts-ignore
//import DockerEvents from "@direktspeed/docker-events";
//import Dockerode from 'dockerode';
import { EventEmitter } from 'node:events';
import type { WORKSPACE } from './types'
import { dev } from '$app/environment';
//import { SSH_KEY } from '$env/static/private'

const rootPath = dev ? '../server/workspaces': "/workspaces"

console.log(rootPath)

export const workspaceEmitter = new EventEmitter();

async function _cmd(command: string[], workspace: string) {
    let p = spawn(command[0], command.slice(1), { /*env: {SSH_KEY},*/ cwd: `${workspace}`});
    
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
}
  

export async function cmd(cmd: "ps" | "up" | "down" | "config", workspace: string, options?: string[]){
    if(cmd === 'ps' || cmd === 'config') return await cmdCompose(cmd, workspace, options)
    
    try{
        const result = await _cmd(['docker', 'compose', cmd, ...(options || [])], workspace)
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

export async function upWorkspace(workspace: string){
    return await cmd('up', `${rootPath}/${workspace}`, ["--build"])
}

export async function downWorkspace(workspace: string){
    return await cmd('down', `${rootPath}/${workspace}`, ['-v'])
}

async function isRunning(name: string){
    const ps = await getWorkspaceState(name)
    return ps.services.length > 0
}

async function createWorkspace(name: string, specification: string, readme: string){
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
    //await downWorkspace(p)
    await rm(p, { recursive: true, force: true });
    return {done: true}
}

/// END WORKSPACE
