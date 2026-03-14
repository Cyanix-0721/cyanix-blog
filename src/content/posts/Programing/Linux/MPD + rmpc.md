# MPD + Rmpc 完整使用指南

## 1 概述

[MPD](https://www.musicpd.org/)（Music Player Daemon）是一个客户端-服务器模式的音乐播放器，[RMPC](https://github.com/mierak/rmpc) 是一个功能丰富的现代 MPD 客户端，提供直观的 TUI 界面和强大的 CLI 功能。

## 2 安装软件包

### 2.1 安装 MPD

```bash
sudo pacman -S mpd rmpc
```

## 3 配置 MPD

### 3.1 创建配置目录和文件

```bash
mkdir -p ~/.config/mpd/playlists
cp /usr/share/doc/mpd/mpdconf.example ~/.config/mpd/mpd.conf
```

### 3.2 使用你的 MPD 配置

编辑 `~/.config/mpd/mpd.conf`

```bash
music_directory     "~/Music"
playlist_directory  "~/.config/mpd/playlists"
db_file             "~/.config/mpd/mpd.db"
log_file            "~/.config/mpd/mpd.log"
pid_file            "~/.config/mpd/mpd.pid"
state_file          "~/.config/mpd/mpd.state"

bind_to_address     "127.0.0.1"
port                "6600"

restore_paused "yes"
auto_update "yes"

audio_output {
    type    "pipewire"
    name    "PipeWire Sound Server"
}
audio_output {
    type    "fifo"
    name    "my_fifo"
    path    "/tmp/mpd.fifo"
    format  "44100:16:2"
}
```

## 4 启动和初始化

### 4.1 启动 MPD 服务

```bash
sudo systemctl --user enable --now mpd
```

### 4.2 创建音乐目录

```bash
mkdir -p ~/Music
```

### 4.3 更新音乐数据库

```bash
# 使用 rmpc 更新数据库
rmpc update

# 或者等待 MPD 自动更新（根据你的 auto_update 设置）
```

## 5 Rmpc 配置和使用

### 5.1 Rmpc 配置文件

 `~/.config/rmpc/config.ron`

 ```ron
 #![enable(implicit_some)]
#![enable(unwrap_newtypes)]
#![enable(unwrap_variant_newtypes)]
(
    address: "127.0.0.1:6600",
    password: None,
    theme: Some("Catppuccin Macchiato"),
    cache_dir: None,
    on_song_change: None,
    volume_step: 5,
    max_fps: 30,
    scrolloff: 0,
    wrap_navigation: false,
    enable_mouse: true,
    enable_config_hot_reload: true,
    status_update_interval_ms: 1000,
    rewind_to_start_sec: None,
    reflect_changes_to_playlist: false,
    select_current_song_on_change: false,
    browser_song_sort: [Disc, Track, Artist, Title],
    directories_sort: SortFormat(group_by_type: true, reverse: false),
    album_art: (
        method: Auto,
        max_size_px: (width: 1200, height: 1200),
        disabled_protocols: ["http://", "https://"],
        vertical_align: Center,
        horizontal_align: Center,
    ),
    keybinds: (
        global: {
            ":":       CommandMode,
            ",":       VolumeDown,
            "s":       Stop,
            ".":       VolumeUp,
            "<Tab>":   NextTab,
            "<S-Tab>": PreviousTab,
            "1":       SwitchToTab("Queue"),
            "2":       SwitchToTab("Directories"),
            "3":       SwitchToTab("Artists"),
            "4":       SwitchToTab("Album Artists"),
            "5":       SwitchToTab("Albums"),
            "6":       SwitchToTab("Playlists"),
            "7":       SwitchToTab("Search"),
            "q":       Quit,
            ">":       NextTrack,
            "p":       TogglePause,
            "<":       PreviousTrack,
            "f":       SeekForward,
            "z":       ToggleRepeat,
            "x":       ToggleRandom,
            "c":       ToggleConsume,
            "v":       ToggleSingle,
            "b":       SeekBack,
            "~":       ShowHelp,
            "u":       Update,
            "U":       Rescan,
            "I":       ShowCurrentSongInfo,
            "O":       ShowOutputs,
            "P":       ShowDecoders,
            "R":       AddRandom,
        },
        navigation: {
            "k":         Up,
            "j":         Down,
            "h":         Left,
            "l":         Right,
            "<Up>":      Up,
            "<Down>":    Down,
            "<Left>":    Left,
            "<Right>":   Right,
            "<C-k>":     PaneUp,
            "<C-j>":     PaneDown,
            "<C-h>":     PaneLeft,
            "<C-l>":     PaneRight,
            "<C-u>":     UpHalf,
            "N":         PreviousResult,
            "a":         Add,
            "A":         AddAll,
            "r":         Rename,
            "n":         NextResult,
            "g":         Top,
            "<Space>":   Select,
            "<C-Space>": InvertSelection,
            "G":         Bottom,
            "<CR>":      Confirm,
            "i":         FocusInput,
            "J":         MoveDown,
            "<C-d>":     DownHalf,
            "/":         EnterSearch,
            "<C-c>":     Close,
            "<Esc>":     Close,
            "K":         MoveUp,
            "D":         Delete,
            "B":         ShowInfo,
        },
        queue: {
            "D":       DeleteAll,
            "<CR>":    Play,
            "<C-s>":   Save,
            "a":       AddToPlaylist,
            "d":       Delete,
            "C":       JumpToCurrent,
            "X":       Shuffle,
        },
    ),
    search: (
        case_sensitive: false,
        mode: Contains,
        tags: [
            (value: "any",         label: "Any Tag"),
            (value: "artist",      label: "Artist"),
            (value: "album",       label: "Album"),
            (value: "albumartist", label: "Album Artist"),
            (value: "title",       label: "Title"),
            (value: "filename",    label: "Filename"),
            (value: "genre",       label: "Genre"),
        ],
    ),
    artists: (
        album_display_mode: NameOnly,
        album_sort_by: Name,
    ),
tabs: [
    (
        name: "Queue",
        pane: Split(
            direction: Horizontal,
            panes: [(size: "60%", pane: Pane(Queue)), (size: "40%", pane: Pane(AlbumArt))],
        ),
    ),
    (
        name: "Directories",
        pane: Pane(Directories),
    ),
    (
        name: "Artists",
        pane: Pane(Artists),
    ),
    (
        name: "Album Artists",
        pane: Pane(AlbumArtists),
    ),
    (
        name: "Albums",
        pane: Pane(Albums),
    ),
    (
        name: "Playlists",
        pane: Pane(Playlists),
    ),
    (
        name: "Search",
        pane: Pane(Search),
    ),
],
)
 ```

`~/.config/rmpc/themes/Catppuccin Macchiato.ron`

```ron
#![enable(implicit_some)]
#![enable(unwrap_newtypes)]
#![enable(unwrap_variant_newtypes)]
(
    default_album_art_path: None,
    draw_borders: false,
    show_song_table_header: false,
    symbols: (song: "🎵", dir: "📁", playlist: "🎼", marker: "\u{e0b0}"),
    layout: Split(
        direction: Vertical,
        panes: [
            (
                pane: Pane(Header),
                size: "1",
            ),
            (
                pane: Pane(TabContent),
                size: "100%",
            ),
            (
                pane: Pane(ProgressBar),
                size: "1",
            ),
        ],
    ),
    progress_bar: (
        symbols: ["", "", "⭘", " ", " "],
        track_style: (bg: "#1e2030"),
        elapsed_style: (fg: "#c6a0f6", bg: "#1e2030"),
        thumb_style: (fg: "#c6a0f6", bg: "#1e2030"),
    ),
    scrollbar: (
        symbols: ["│", "█", "▲", "▼"],
        track_style: (),
        ends_style: (),
        thumb_style: (fg: "#b7bdf8"),
    ),
    browser_column_widths: [20, 38, 42],
    text_color: "#cad3f5",
    background_color: "#24273a",
    header_background_color: "#1e2030",
    modal_background_color: None,
    modal_backdrop: false,
    tab_bar: (active_style: (fg: "black", bg: "#c6a0f6", modifiers: "Bold"), inactive_style: ()),
    borders_style: (fg: "#6e738d"),
    highlighted_item_style: (fg: "#c6a0f6", modifiers: "Bold"),
    current_item_style: (fg: "black", bg: "#b7bdf8", modifiers: "Bold"),
    highlight_border_style: (fg: "#b7bdf8"),
    song_table_format: [
        (
            prop: (kind: Property(Artist), style: (fg: "#b7bdf8"), default: (kind: Text("Unknown"))),
            width: "50%",
            alignment: Right,
        ),
        (
            prop: (kind: Text("-"), style: (fg: "#b7bdf8"), default: (kind: Text("Unknown"))),
            width: "1",
            alignment: Center,
        ),
        (
            prop: (kind: Property(Title), style: (fg: "#7dc4e4"), default: (kind: Text("Unknown"))),
            width: "50%",
        ),
    ],
    header: (
        rows: [
            (
                left: [
                    (kind: Text("["), style: (fg: "#b7bdf8", modifiers: "Bold")),
                    (kind: Property(Status(State)), style: (fg: "#b7bdf8", modifiers: "Bold")),
                    (kind: Text("]"), style: (fg: "#b7bdf8", modifiers: "Bold"))
                ],
                center: [
                    (kind: Property(Song(Artist)), style: (fg: "#eed49f", modifiers: "Bold"),
                        default: (kind: Text("Unknown"), style: (fg: "#eed49f", modifiers: "Bold"))
                    ),
                    (kind: Text(" - ")),
                    (kind: Property(Song(Title)), style: (fg: "#7dc4e4", modifiers: "Bold"),
                        default: (kind: Text("No Song"), style: (fg: "#7dc4e4", modifiers: "Bold"))
                    )
                ],
                right: [
                    (kind: Text("Vol: "), style: (fg: "#b7bdf8", modifiers: "Bold")),
                    (kind: Property(Status(Volume)), style: (fg: "#b7bdf8", modifiers: "Bold")),
                    (kind: Text("% "), style: (fg: "#b7bdf8", modifiers: "Bold"))
                ]
            )
        ],
    ),
)
```

### 5.2 启动 Rmpc TUI

```bash
rmpc
```

### 5.3 Rmpc TUI 基本操作

#### 5.3.1 标签页导航

| 快捷键 | 功能 |
|--------|------|
| `1` | 切换到播放队列标签页 |
| `2` | 切换到目录浏览标签页 |
| `3` | 切换到艺术家标签页 |
| `4` | 切换到专辑艺术家标签页 |
| `5` | 切换到专辑标签页 |
| `6` | 切换到播放列表标签页 |
| `7` | 切换到搜索标签页 |
| `Tab` / `S-Tab` | 下一个/上一个标签页 |

#### 5.3.2 播放控制

| 快捷键 | 功能 |
|--------|------|
| `p` | 播放/暂停 |
| `>` | 下一首 |
| `<` | 上一首 |
| `s` | 停止 |
| `f` | 快进 |
| `b` | 快退 |

#### 5.3.3 播放模式

| 快捷键 | 功能 |
|--------|------|
| `z` | 切换重复模式 |
| `x` | 切换随机模式 |
| `c` | 切换消费模式 |
| `v` | 切换单曲模式 |

#### 5.3.4 音量控制

| 快捷键 | 功能 |
|--------|------|
| `.` | 增加音量 |
| `,` | 降低音量 |

#### 5.3.5 导航操作

| 快捷键 | 功能 |
|--------|------|
| `j`/`k` | 上下移动 |
| `h`/`l` | 左右移动（在分栏界面） |
| `Enter` | 确认/播放选中项目 |
| `Space` | 选择项目 |
| `a` | 添加到播放列表 |
| `A` | 添加所有项目到播放列表 |

## 6 [Rmpc CLI 命令参考](https://mierak.github.io/rmpc/next/reference/cli-command-mode/)

### 6.1 基本播放控制

```bash
# 播放控制
rmpc play
rmpc pause
rmpc togglepause
rmpc stop
rmpc next
rmpc prev

# 音量控制
rmpc volume 80        # 设置音量为 80%
rmpc volume +5        # 增加 5% 音量
rmpc volume -5        # 减少 5% 音量
```

### 6.2 播放列表管理

```bash
# 添加音乐到播放列表
rmpc add /              # 添加整个音乐库（等效于 mpc listall | mpc add）
rmpc add "Artist/Album" # 添加特定路径的音乐

# 播放列表操作
rmpc clear             # 清空播放列表
rmpc status            # 查看播放状态
rmpc song              # 显示当前歌曲信息
```

### 6.3 数据库管理

```bash
# 更新音乐数据库
rmpc update           # 扫描新增和修改的文件
rmpc rescan           # 完全重新扫描所有文件

# 搜索音乐
rmpc search artist "艺术家名"
rmpc search album "专辑名"
rmpc search title "歌曲名"
```

### 6.4 远程控制

```bash
# 控制运行中的 rmpc 实例
rmpc remote keybind p          # 模拟按 p 键（播放/暂停）
rmpc remote switchtab "Queue"  # 切换到队列标签页
rmpc remote status "消息"      # 显示状态消息
```

## 7 实用操作示例

### 7.1 快速播放整个音乐库

```bash
# 清空播放列表并添加所有音乐
rmpc clear && rmpc add / && rmpc play
```

### 7.2 创建播放列表别名

在 `~/.bashrc` 或 `~/.zshrc` 中添加：

```bash
# 播放整个音乐库
alias playall='rmpc clear && rmpc add / && rmpc play'

# 随机播放音乐
alias randomplay='rmpc clear && rmpc addrandom && rmpc play'

# 显示当前播放状态
alias nowplaying='rmpc status'
```

### 7.3 搜索并播放特定音乐

```bash
# 搜索特定艺术家的音乐并播放
rmpc search artist "Coldplay" | rmpc add && rmpc play

# 搜索特定专辑
rmpc search album "A Rush of Blood to the Head" | rmpc add
```

## 8 故障排除

### 8.1 常见问题解决

**MPD 无法启动**：

```bash
# 检查配置语法
mpd --check

# 杀死现有进程并重新启动
mpd --kill
mpd

# 查看详细日志
tail -f ~/.config/mpd/mpd.log
```

**Rmpc 连接失败**：

```bash
# 检查 MPD 是否运行
rmpc status

# 检查连接地址和端口
# 确保与 mpd.conf 中的 bind_to_address 和 port 一致
```

**音乐库更新问题**：

```bash
# 强制重新扫描音乐库
rmpc rescan

# 删除数据库文件并重新创建（最后手段）
rm ~/.config/mpd/mpd.db
rmpc update
```

### 8.2 音频输出问题

**检查音频输出状态**：

```bash
# 查看可用音频输出
rmpc outputs

# 切换音频输出（如果需要）
rmpc toggleoutput "输出名称"
```
