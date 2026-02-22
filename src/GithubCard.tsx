import React, { useEffect, useState } from "react";
import { StarIcon, RepoForkedIcon } from "@primer/octicons-react";
import { linguistData } from "linguist-colors-list";

export interface GithubRepoData {
    name: string;
    description: string;
    html_url: string;
    stargazers_count: number;
    forks_count: number;
    language: string | null;
    topics?: string[];
    owner: { avatar_url: string };
    languages?: GithubRepoLanguageData;
}

type GithubRepoLanguageData = Record<string, number>;

interface GithubCardProps {
    username: string;
    repo: string;
    theme?: "light" | "dark";
    showLanguagesBar?: boolean;
}

interface GithubCardDummyProps {
    username: string;
    theme?: "light" | "dark";
    data: GithubRepoData;
}

interface GithubCardBaseProps {
    username: string;
    theme: "light" | "dark";
    data: GithubRepoData;
    showLanguagesBar?: boolean;
}

const getContainerStyle = (theme: "light" | "dark"): React.CSSProperties => {
    const isDark = theme === "dark";
    return {
        padding: "16px",
        borderRadius: "8px",
        border: `1px solid ${isDark ? "#30363d" : "#e1e4e8"}`,
        backgroundColor: isDark ? "#0d1117" : "#ffffff",
        color: isDark ? "#c9d1d9" : "#24292e",
        fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
        maxWidth: "400px",
    };
};

const GithubCardBase: React.FC<GithubCardBaseProps> = ({
    username,
    theme,
    data,
    showLanguagesBar = false,
}) => {
    const isDark = theme === "dark";

    return (
        <div style={getContainerStyle(theme)}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <img
                    src={data.owner?.avatar_url ?? "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"}
                    alt={username}
                    style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                    }}
                />
                <a
                    href={data.html_url}
                    style={{
                        color: isDark ? "#58a6ff" : "#0366d6",
                        textDecoration: "none",
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {username}/{data.name}
                </a>
            </div>
            <p>{data.description || "No description provided."}</p>
            <div style={{ display: "flex", flexWrap: "wrap", marginBottom: "8px" }}>
                {data.topics && data.topics.length > 0 && (
                    <span>
                        {data.topics.map((topic) => (
                            <span
                                key={topic}
                                style={{
                                    backgroundColor: isDark ? "#21262d" : "#f1f8ff",
                                    color: isDark ? "#c9d1d9" : "#0366d6",
                                    padding: "2px 6px",
                                    borderRadius: "2em",
                                    fontSize: "12px",
                                    marginRight: "4px",
                                    display: "inline-block",
                                }}
                            >
                                {topic}
                            </span>
                        ))}
                    </span>
                )}
            </div>
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "12px",
                    alignItems: "center",
                    marginTop: "8px",
                }}
            >
                {data.language && (
                    <span>
                        <span
                            style={{
                                backgroundColor:
                                    linguistData[data.language]?.color || "#ededed",
                                width: "12px",
                                height: "12px",
                                borderRadius: "50%",
                                display: "inline-block",
                                marginRight: "4px",
                            }}
                        />
                        {data.language}
                    </span>
                )}

                <span>
                    <StarIcon size="small" />{" "}
                    {data.stargazers_count.toLocaleString()}
                </span>

                <span>
                    <RepoForkedIcon size="small" />{" "}
                    {data.forks_count.toLocaleString()}
                </span>
            </div>

            {data.languages && Object.keys(data.languages).length > 0 && (
                <div
                    style={{
                        display: "flex",
                        width: "100%",
                        height: "8px",
                        borderRadius: "4px",
                        overflow: "hidden",
                        marginTop: "12px",
                    }}
                >
                    {(() => {
                        const total = Object.values(data.languages!).reduce(
                            (a, b) => a + b,
                            0
                        );

                        return Object.entries(data.languages!).map(([lang, bytes]) => {
                            const percentage = (bytes / total) * 100;
                            const color =
                                linguistData[lang]?.color || "#ededed";

                            return (
                                <div
                                    key={lang}
                                    title={`${lang}: ${bytes.toLocaleString()} bytes`}
                                    style={{
                                        backgroundColor: color,
                                        width: `${percentage}%`,
                                    }}
                                />
                            );
                        });
                    })()}
                </div>
            )}
        </div>
    );
};

export const GithubCard: React.FC<GithubCardProps> = ({
    username,
    repo,
    theme = "light",
    showLanguagesBar = false,
}) => {
    const [data, setData] = useState<GithubRepoData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();

        const fetchRepo = async () => {
            try {
                setLoading(true);
                setError(null);

                const headers: HeadersInit = {
                    Accept: "application/vnd.github.v3+json",
                };

                const res = await fetch(
                    `https://api.github.com/repos/${username}/${repo}`,
                    { headers, signal: controller.signal },
                );

                if (!res.ok) {
                    throw new Error(`GitHub API responded with ${res.status}`);
                }

                let json: GithubRepoData = await res.json();
                // Fetch languages data if showLanguagesBar is true
                if (showLanguagesBar) {
                    const langRes = await fetch(
                        `https://api.github.com/repos/${username}/${repo}/languages`,
                        { headers, signal: controller.signal },
                    );
                    if (langRes.ok) {
                        const langData = await langRes.json();
                        json.languages = langData;
                    } else {
                        console.warn(`Failed to fetch languages for ${username}/${repo}: ${langRes.status}`);
                    }
                }

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
    }, [username, repo, showLanguagesBar]);

    if (loading) {
        return <div style={getContainerStyle(theme)}>Loading...</div>;
    }

    if (error || !data) {
        return (
            <div style={getContainerStyle(theme)}>
                Could not load {username}/{repo}
            </div>
        );
    }

    return <GithubCardBase username={username} theme={theme} data={data} showLanguagesBar={showLanguagesBar} />;
};

export const GithubCardDummy: React.FC<GithubCardDummyProps> = ({
    username,
    theme = "light",
    data,
}) => {
    return <GithubCardBase username={username} theme={theme} data={data} />;
};
