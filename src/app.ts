// トリガーが前日の23時台に発火するので、投稿する日報の翌日のカレンダーの予定を取得する
const getEvents = (): GoogleAppsScript.Calendar.CalendarEvent[] => {
    const calendar = CalendarApp.getDefaultCalendar()
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const from = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 0, 0, 0)
    const to = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23, 59, 59)
    return calendar.getEvents(from, to)
}

const date2HourAndMinute = (d: GoogleAppsScript.Base.Date): string => {
    return Utilities.formatDate(d, "Asia/Tokyo", "HH:mm")
}

const event2TimeString = (e: GoogleAppsScript.Calendar.CalendarEvent): string => {
    return `${date2HourAndMinute(e.getStartTime())} ~ ${date2HourAndMinute(e.getEndTime())}`
}

const event2MembersString = (e: GoogleAppsScript.Calendar.CalendarEvent, maxMembers: number): string => {
    const members = e.getGuestList()
    if (members.length == 0) {
        return ""
    }
    return members.slice(0, Math.min(members.length - 1, maxMembers)).map((g: GoogleAppsScript.Calendar.EventGuest) => {
        if (g.getName() != "") {
            return g.getName()
        } else {
            return g.getEmail()
        }

    }).join(", ")
}

const todayEvents2String = (): string => {
    const events = getEvents()
    if (events.length == 0) {
        return ""
    }
    let str = ""
    str += "## 本日の予定\n"
    events.forEach((calendarEvent: GoogleAppsScript.Calendar.CalendarEvent) => {
        // 参加しない予定は表示しない
        if (calendarEvent.getMyStatus() as GoogleAppsScript.Calendar.GuestStatus === CalendarApp.GuestStatus.NO) {
            return 
        }
        console.log(calendarEvent.getTitle())
        str += `- ${calendarEvent.getTitle()}\n`
        str += `  - 時間: ${event2TimeString(calendarEvent)}\n`

        // 一行に抑えたいので、改行を置換する
        const description = calendarEvent.getDescription().replace(/\r?\n/g, " ")
        if (description != "") {
            str += `  - 説明: ${description}\n`
        }

        const membersStr = event2MembersString(calendarEvent, 3)
        if (membersStr != "") {
            str += `  - メンバー: ${membersStr}\n`
        }
    })
    return str
}

function formatDate(dt: Date): string {
    const y = dt.getFullYear();
    const m = ('00' + (dt.getMonth() + 1)).slice(-2);
    const d = ('00' + dt.getDate()).slice(-2);
    return (y + '/' + m + '/' + d);
}

const recipient = PropertiesService.getScriptProperties().getProperty("recipient")

const submitMail = (content: string) => {
    if (content == "") {
        return
    }
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const title = `${formatDate(tomorrow)}の予定です`
    GmailApp.sendEmail(recipient, title, content)
}

// 一回だけ作るトリガー
function setOnceTrigger() {
    ScriptApp.newTrigger("main").timeBased().atHour(23).everyDays(1).create();
}

const main = () => {
    submitMail(todayEvents2String())
}