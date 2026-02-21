import React, { useEffect, useState } from "react";
import { StarIcon, RepoForkedIcon } from "@primer/octicons-react";

interface GithubCardProps {
    username: string;
    repo: string;
    theme?: "light" | "dark";
}

interface GithubRepoData {
    name: string;
    description: string;
    html_url: string;
    stargazers_count: number;
    forks_count: number;
    language: string;
}

export const GithubCard: React.FC<GithubCardProps> = ({
    username,
    repo,
    theme = "light"
}) => {
    const [data, setData] = useState<GithubRepoData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();

        const fetchRepo = async () => {
            try {
                const headers: HeadersInit = {
                    Accept: "application/vnd.github.v3+json"
                };

                const res = await fetch(
                    `https://api.github.com/repos/${username}/${repo}`,
                    { headers, signal: controller.signal }
                );

                if (!res.ok) {
                    throw new Error(`GitHub API responded with ${res.status}`);
                }

                const json: GithubRepoData = await res.json();
                setData(json);
            } catch (err) {
                if (!controller.signal.aborted) {
                    setError("Failed to load repository");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchRepo();

        return () => controller.abort();
    }, [username, repo]);

    const isDark = theme === "dark";

    const styles = {
        container: {
            padding: "16px",
            borderRadius: "8px",
            border: `1px solid ${isDark ? "#30363d" : "#e1e4e8"}`,
            backgroundColor: isDark ? "#0d1117" : "#ffffff",
            color: isDark ? "#c9d1d9" : "#24292e",
            fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
            maxWidth: "400px"
        } as React.CSSProperties
    };

    if (loading) {
        return <div style={styles.container}>Loading...</div>;
    }

    if (error || !data) {
        return (
            <div style={styles.container}>
                Could not load {username}/{repo}
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <a href={data.html_url} target="_blank" rel="noopener noreferrer">
                {username}/{data.name}
            </a>
            <p>{data.description || "No description provided."}</p>
            <div style={{ display: "flex", flexDirection: "row", gap: "8px", alignItems: "center" }}>
                {data.language && <span>● {data.language}</span>}
                <span><StarIcon size="small" className="mr-1" /> {data.stargazers_count.toLocaleString()}</span>
                <span><RepoForkedIcon size="small" className="mr-1" /> {data.forks_count.toLocaleString()}</span>
            </div>
        </div>
    );
};