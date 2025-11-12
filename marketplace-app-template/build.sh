# build command format is
# sh build.sh <lambdaApiUrl> <lambdaApiKey> <apiOnly or uiOnly or undefined>
# example commands:
# 	sh build.sh https://lambda.com De48ng439 apiOnly
# 	sh build.sh https://lambda.com De48ng439 uiOnly
# 	sh build.sh https://lambda.com De48ng439

set -e
#The above command is to fail build if any one of the below build steps fail
buildType="$3"

rm -rf to-deploy
mkdir to-deploy

#API Build
if [ "$buildType" != "uiOnly" ]
	then
		cd api
		rm -rf node_modules
		npm install
		npm run test
		npm run precommit
		npm install --only=prod
		zip -r api.zip * -x jest* package*.json server.js
		mv api.zip ../to-deploy
		cd ..
fi


#UI Build
if [ "$buildType" != "apiOnly" ]
	then
		updateUIConfigFile() {
			if [ "$1" == "" ]
				then
					echo "Missing Lambda API_URL input parameter"
					exit $1
			fi
			rm -rf .newEnv
			sed '/^REACT_APP_API_URL/d;/^REACT_APP_API_KEY/d' .env > .newEnv
			echo "REACT_APP_API_URL=$1" >> .newEnv
			echo $2
			echo "REACT_APP_API_KEY=$2" >> .newEnv
			rm -rf .env
			mv .newEnv .env
		}
		cd ui
		rm -rf build
		rm -rf node_modules
		updateUIConfigFile $1 $2
		npm install
		npm run test
		npm run precommit
		npm run build
		zip -r ui.zip build/
		mv ui.zip ../to-deploy
		cd ..
fi
