import calendar
import re
from datetime import datetime

def lastDayOfMonth(year, month):
    _, last_day = calendar.monthrange(year, month)
    return datetime(year, month, last_day)

sourceText = input('Give the previous year source text to base off from: ')

# asks user for start bloom dates and formats it in the variable bloomStartDate
bloomStartDate = input("start of blooming (format -> dd,mm,yyyy): ") 
bloomStartDate=bloomStartDate.replace(" ", "")
bloomStartDate=bloomStartDate.split(',')
print(bloomStartDate)

#asks user for end bloom dates and formats it in the variable bloomEndDate
bloomEndDate = input("end of blooming (format -> dd,mm,yyyy): ")
bloomEndDate=bloomEndDate.replace(" ", "")
bloomEndDate=bloomEndDate.split(',')
print(bloomEndDate)

def dateCompiler(bloomStartDate, bloomEndDate):
    #creates array of bloom dates in the format 'yyyy-mm-dd'
    if  bloomStartDate[2] == bloomEndDate[2]:
        print('same year')
        if  bloomStartDate[1] == bloomEndDate[1]:
            print('same month, one day only')
            if  bloomStartDate[0] == bloomEndDate[0]:
                rawDates = f'{int(bloomStartDate[2])}-{int(bloomStartDate[1]):02d}-{int(bloomStartDate[0]):02d}'
                return rawDates
                #print(rawDates)
            else:
                print('same month, different days')
                rawDates = []
                smStartDate = int(bloomStartDate[0])
                emEndDate = int(bloomEndDate[0])
                yearBloom = int(bloomStartDate[2])
                monthBloom = int(bloomStartDate[1])
                while smStartDate <= emEndDate:
                    rawDates.append(f'{int(yearBloom)}-{int(monthBloom):02d}-{int(smStartDate):02d}')
                    smStartDate +=1
                return rawDates
        else:
            #only works for the next month - which is all of what i need for my project
            print('different month, same year')
            rawDates = []
            newMonthCounter = 1
            nextMonthEndDate = int(bloomEndDate[0])
            yearBloom = int(bloomStartDate[2])
            startMonthBloom = int(bloomStartDate[1])
            endMonthBloom = int(bloomEndDate[1])
            startMonthDateVAR = int(bloomStartDate[0])
            lastDate = lastDayOfMonth(int(bloomEndDate[2]), int(bloomEndDate[1]))
            lastDayOfThisMonth = int(lastDate.day)
            while startMonthDateVAR <= lastDayOfThisMonth:
                rawDates.append(f'{int(yearBloom)}-{int(startMonthBloom):02d}-{int(startMonthDateVAR):02d}')
                startMonthDateVAR +=1
            while newMonthCounter <= nextMonthEndDate:
                rawDates.append(f'{int(yearBloom)}-{int(endMonthBloom):02d}-{int(newMonthCounter):02d}')
                newMonthCounter +=1
            return rawDates
    else:
        #december and january dates from adjacent years
        rawDates = []
        janDayCounter = 1
        startMonthBloom = 12
        endMonthBloom = 1
        endYearBloom = int(bloomEndDate[2])
        startYearBloom = int(bloomStartDate[2])
        endDateBloom = int(bloomEndDate[0])
        startDateBloom = int(bloomStartDate[0])

        dtRawLastDay = lastDayOfMonth(int(startYearBloom),startMonthBloom)
        decLastDay = int(dtRawLastDay.day)

        while startDateBloom <= decLastDay:
            rawDates.append(f'{startYearBloom}-{startMonthBloom}-{startDateBloom:02d}')
            startDateBloom +=1
        while janDayCounter <= endDateBloom:
            rawDates.append(f'{endYearBloom}-{endMonthBloom:02d}-{janDayCounter:02d}')
            janDayCounter +=1
        return rawDates

def firstTemplate(data):
    start_index = data.find("eventName: ")
    if start_index != -1:
        start_index += len("eventName: ")
    # Find the index of the next key (in this case, 'date')
    end_index = data.find("date: ")
    if end_index == -1:
    # If 'date' is not found, assume it's the end of the string
        end_index = len(data)
    # Extract the desired substring
    part1 = data[start_index:end_index].strip()
    return part1

def lastTemplate(eventInfo):
    match = re.search(r"blogLink:\s*'([^']+)'", eventInfo)
    if match:
        extracted_blog_link = match.group(1)
        return extracted_blog_link
    return None


def formatEntry(part1, part2, arrayOfDates):
    masterEntryArray = []
    for i in arrayOfDates:
        singleEntry = f"{{eventName: {part1} date: '{i}', blogLink: '{part2}' }},"
        masterEntryArray.append(singleEntry)
    return masterEntryArray
#{ eventName: 'Crooked brook Sunflowers', calendar: 'Sunflowers', color: 'yellow', duration:'January', date: '2024-01-13', blogLink: '/blogPages/sunflower.html' },
    

part1Text = firstTemplate(sourceText)
part2Text = lastTemplate(sourceText)
arrayOfDates = dateCompiler(bloomStartDate, bloomEndDate)
entireEntry = formatEntry(part1Text,part2Text,arrayOfDates)
for j in entireEntry:
    print(j)


#why does february produce up to 31 days lmao!!!!