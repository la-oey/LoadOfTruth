setwd("/Users/loey/Desktop/Research/FakeNews/LoadOfTruth/Exp1/analysis/")
library(tidyverse)
library(stats4)

raw <- read_csv("raw.csv")

distinct(raw, catchQuestion)

count(raw, subjID) %>%
  arrange(n)

glimpse(raw)
raw <- raw %>%
  mutate(subjID = as.factor(paste0("subj",str_pad(group_indices(.,subjID),3,pad="0"))),
         catchQuestion = ifelse(catchResponse == -1, "NA", catchQuestion),
         catchQuestionAbbr = case_when(
           catchQuestion == "What number did you tell the other player?" ~ "report",
           catchQuestion == "What number did you actually roll?" ~ "truth",
           TRUE ~ "NA"
         ))

bads <- raw %>% filter(catchQuestionAbbr %in% c("report", "truth")) %>% group_by(subjID) %>% 
  summarise(accuracy = mean(catchResponse == catchKey)) %>% 
  mutate(badsubject = accuracy < .75)


bads %>%
  filter(badsubject) %>%
  nrow()

length(unique(raw$subjID))


raw <- raw %>%
  left_join(bads)

raw %>%
  filter(badsubject) %>%
  .$subjID %>%
  unique()

conds <- raw %>%
  distinct(subjID, catchQuestionAbbr) %>%
  filter(catchQuestionAbbr != "NA") %>%
  rename(condition = catchQuestionAbbr)

df <- raw %>%
  filter(!badsubject, exptPart == "trial") %>%
  rename(role = roleCurrent,
         k = trueRoll,
         ksay = reportedRoll) %>%
  mutate(role = ifelse(role=="bullshitter", "sender", "receiver")) %>%
  select(subjID, trialNumber, role, k, ksay, callBS, catchQuestion, catchQuestionAbbr, catchResponse, catchKey, catchResponseTime) %>%
  left_join(conds)

length(unique(df$subjID))

write_csv(df, "df.csv")


sender <- df %>%
  filter(role == "sender")
write_csv(sender, "sender.csv")

receiver <- df %>%
  filter(role == "receiver")
write_csv(receiver, "receiver.csv")

glimpse(df)
