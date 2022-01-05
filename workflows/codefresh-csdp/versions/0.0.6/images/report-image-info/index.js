const { GraphQLClient, gql } = require('graphql-request')

const init = async () => {

    const image = process.env.IMAGE_URI;

    const manifest = JSON.parse(process.env.IMAGE_MANIFEST);
    const metadata = JSON.parse(process.env.IMAGE_METADATA);
    const imageDigest = process.env.IMAGE_DIGEST;

    const size = manifest.layers.reduce((sum, layer) => {
        return sum + layer.size;
    }, manifest.config.size);

    const graphQLClient = new GraphQLClient(`${process.env.CF_HOST}/2.0/api/graphql`, {
        headers: {
            'Authorization': process.env.CF_API_KEY,
        },
    })

    console.log('REPORT_IMAGE_V2: binaryQuery payload:', {
        id: `${manifest.config.digest}`,
        created: `${metadata.created}`,
        imageName: `${image}`,
        branch: `${process.env.GIT_BRANCH}`,
        commit: `${process.env.GIT_REVISION}`,
        commitMsg: `${process.env.GIT_COMMIT_MESSAGE}`,
        commitURL: `${process.env.GIT_COMMIT_URL}`,
        size: `${size}`,
        os: `${metadata.os}`,
        architecture: `${metadata.architecture}`,
    })

    const binaryQuery = gql`mutation {
        createImageBinary(imageBinary: {
            id: "${manifest.config.digest}",
            created: "${metadata.created}",
            imageName: "${image}",
            branch: "${process.env.GIT_BRANCH}",
            commit: "${process.env.GIT_REVISION}",
            commitMsg: "${process.env.GIT_COMMIT_MESSAGE}",
            commitURL: "${process.env.GIT_COMMIT_URL}",
            size: ${size},
            os: "${metadata.os}",
            architecture: "${metadata.architecture}",
        }) {
            id,
            imageName,
            branch,
            commit,
            commitMsg,
            commitURL,
        }
    }`
    const binaryResult = await graphQLClient.request(binaryQuery)
    console.log('REPORT_IMAGE_V2: binaryQuery response:', JSON.stringify(binaryResult, null, 2))

    const query = gql`mutation {
        createImageRegistry(imageRegistry: {
            binaryId: "${binaryResult.createImageBinary.id}",
            imageName: "${image}",
            repoDigest: "${imageDigest}",
            created: "${metadata.created}",
        }) {
            binaryId
            imageName
            repoDigest
        }
    }`

    const data = await graphQLClient.request(query)
    console.log(JSON.stringify(data, null, 2))
}


const main = async () => {
    try {
        await init();
    } catch (err) {
        console.error(err.stack);
        process.exit(1);
    }
};

main();
