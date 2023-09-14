export default (postData: any) => {
    for (let prop in postData) {
        if (!postData[prop]) {
            delete postData[prop];
        }
    }
};