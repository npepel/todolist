#!/usr/bin/perl

use strict;
use warnings;

use CGI;
use CGI::Carp 'fatalsToBrowser';
use DBI;
use Data::Dumper;

use lib "/home/nina/perl5/lib/perl5";
use JSON;

my $cgi = CGI->new;
my $user_id = $cgi->param("user_id");
my $list_id = $cgi->param("list_id");


my $dbh = DBI->connect("DBI:mysql:database=todolist;host=localhost;port=3306",  
  "user", "password") 
  or die $DBI::errstr;

my $statement = qq{DELETE FROM profiles WHERE user_id=? AND list_id=? };
my $sth = $dbh->prepare($statement)
  or die $dbh->errstr;
$sth->execute($user_id, $list_id)
  or die $sth->errstr;

$statement = qq{DELETE FROM todos WHERE list_id=? };
$sth = $dbh->prepare($statement)
  or die $dbh->errstr;
$sth->execute($list_id)
  or die $sth->errstr;

my $json = qq{{"user_id" : "$user_id"}};

print $cgi->header(-type => "application/json", -charset => "utf-8");
print $json;