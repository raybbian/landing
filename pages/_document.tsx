import {Html, Head, Main, NextScript} from "next/document";

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                <meta name={"description"} content={"A queue-based to-do list app to motivate myself to solve Codeforces problems daily."}/>
            </Head>
            <body className={"bg-ctp-crust"}>
            <Main/>
            <NextScript/>
            </body>
        </Html>
    );
}
