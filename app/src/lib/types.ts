import type { DockerComposePsResult } from "docker-compose";

export type WORKSPACE = {
    workspace: string,
    readme: string,
    specification: string,
    isValid: boolean,
    services: DockerComposePsResult["services"]
}