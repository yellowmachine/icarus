docker build . -t yellowmachine/codenode -f Dockerfilenode
docker build . -t yellowmachine/codepython -f Dockerfilepython
docker build . -t yellowmachine/codejulia -f Dockerfilejulia

docker push yellowmachine/codenode
docker push yellowmachine/codepython
docker push yellowmachine/codejulia
